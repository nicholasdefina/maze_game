// simple play with matter.js
const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;
const width = window.innerWidth;
const height = window.innerHeight;

const widthInput = document.querySelector('#width');
const heightInput = document.querySelector('#height');
const playAgain = document.querySelector('.is-danger');
const startScreen = document.querySelector('.has-text-centered');
const winnerDiv = document.querySelector('.winner');
playAgain.addEventListener('click', () => {
    window.location.reload(); // lazy reset ;)
})
document.querySelector('.is-primary').addEventListener('click', () => {
    let userWidth = widthInput.value;
    userWidth = isNaN(userWidth) ? 10 : Math.min(Math.max(Math.abs(userWidth), 3), 20);

    let userHeight = heightInput.value;
    userHeight = isNaN(userHeight) ? 10 : Math.min(Math.max(Math.abs(userHeight), 3), 20);
    startScreen.classList.add('hidden');
    createMaze(userWidth, userHeight);
});

function createMaze(gridWidth, gridHeight) {
    const unitWidth = width / gridWidth;
    const unitHeight = height / gridHeight;
    const wallWidth = 2;
    const engine = Engine.create();
    engine.world.gravity.y = 0;
    const { world } = engine;
    const render = Render.create({
        element: document.body,
        engine: engine,
        options: {
            wireframes: false,
            width: width,
            height: height,
        }
    });
    Render.run(render);
    Runner.run(Runner.create(), engine);

    // make/add boundaries
    const boundaries = [
        Bodies.rectangle(width / 2, 0, width, wallWidth, { // x start, y start, x width, y width
            isStatic: true,
        }),
        Bodies.rectangle(width / 2, height, width, wallWidth, {
            isStatic: true,
        }),
        Bodies.rectangle(0, height / 2, wallWidth, height, {
            isStatic: true,
        }),
        Bodies.rectangle(width, height / 2, wallWidth, height, {
            isStatic: true,
        }),
    ]
    World.add(world, boundaries);

    const grid = Array(gridHeight).fill(null).map(() => Array(gridWidth).fill(false));

    const verticals = Array(gridHeight).fill(null).map(() => Array(gridWidth - 1).fill(false));

    const horizontals = Array(gridHeight - 1).fill(null).map(() => Array(gridWidth).fill(false));

    const startRow = Math.floor(Math.random() * gridHeight);
    const startColumn = Math.floor(Math.random() * gridWidth);

    const shuffle = (arr) => {
        let counter = arr.length;

        while (counter > 0) {
            const i = Math.floor(Math.random() * counter)
            counter--;
            const temp = arr[counter];
            arr[counter] = arr[i];
            arr[i] = temp;
        }
        return arr;
    }
    const stepThroughGrid = (row, column) => {
        if (grid[row][column]) {
            return  //already visted
        }
        grid[row][column] = true;

        // assmeble randomly-ordered list of neighbors
        const neighbors = shuffle([
            [row - 1, column, 'up'],
            [row, column + 1, 'right'],
            [row + 1, column, 'down'],
            [row, column - 1, 'left'],
        ]);
        for (let neighbor of neighbors) {
            const [nextRow, nextCol, direction] = neighbor;
            if (nextRow < 0 || nextRow >= gridHeight || nextCol < 0 || nextCol >= gridWidth) {
                continue; // out of bounds
            }
            if (grid[nextRow][nextCol]) {
                continue; // already visited
            }

            // mark arrays for where to remove walls later. true = NO WALL
            if (direction === 'left') {
                verticals[row][column - 1] = true;
            } else if (direction === 'right') {
                verticals[row][column] = true;
            } else if (direction === 'up') {
                horizontals[row - 1][column] = true;
            } else {
                horizontals[row][column] = true;
            }
            // NEED TO DO BACKTRACKING!!!
            stepThroughGrid(nextRow, nextCol);
        }
    };


    stepThroughGrid(startRow, startColumn)

    // remove walls of either horizontals
    horizontals.forEach((row, rowIndex) => {
        row.forEach((shouldNotDraw, colIndex) => {
            if (shouldNotDraw) {
                return;
            }

            const xPoint = (colIndex * unitWidth) + unitWidth / 2
            const yPoint = (rowIndex * unitHeight) + unitHeight

            const wall = Bodies.rectangle(xPoint, yPoint, unitWidth, wallWidth, {
                isStatic: true,
                label: 'wall',
                render: {
                    fillStyle: 'green',
                },
            });
            World.add(world, wall);
        })
    });

    // remove walls of either verticals
    verticals.forEach((row, rowIndex) => {
        row.forEach((shouldNotDraw, colIndex) => {
            if (shouldNotDraw) {
                return;
            }

            const xPoint = (colIndex * unitWidth) + unitWidth;
            const yPoint = (rowIndex * unitHeight) + unitHeight / 2
            const wall = Bodies.rectangle(xPoint, yPoint, wallWidth, unitHeight, {
                isStatic: true,
                label: 'wall',
                render: {
                    fillStyle: 'green',
                },
            });
            World.add(world, wall);
        })
    });

    // 'avatar'
    const radius = Math.min(unitHeight, unitWidth) / 4;
    const avatar = Bodies.circle(
        unitWidth / 2,
        unitHeight / 2,
        radius,
        { label: 'avatar', },
    );
    World.add(world, avatar);

    document.addEventListener('keydown', event => {
        const { x, y } = avatar.velocity;
        const { key, code } = event;
        if (key === 'w' || code === 'KeyW') {
            Body.setVelocity(avatar, { x, y: y - 5 });
        } else if (key === 'd' || code === 'KeyD') {
            Body.setVelocity(avatar, { x: x + 5, y });
        } else if (key === 's' || code === 'Keys') {
            Body.setVelocity(avatar, { x, y: y + 5 });
        } else if (key === 'a' || code === 'KeyA') {
            Body.setVelocity(avatar, { x: x - 5, y });
        }

    })

    // finish
    const finish = Bodies.rectangle(
        width - unitWidth / 2, height - unitHeight / 2, unitWidth * 0.4, unitHeight * 0.4, {
        isStatic: true,
        label: 'finish',
        render: {
            fillStyle: 'white',
        },
    },
    );

    World.add(world, finish);

    // WIN condition
    Events.on(engine, 'collisionStart', event => {
        event.pairs.forEach((collision) => {
            const labels = ['avatar', 'finish'];
            if (labels.includes(collision.bodyA.label) && labels.includes(collision.bodyB.label)) {
                winnerDiv.classList.remove('hidden');
                engine.world.gravity.y = 1;
                world.bodies.forEach((body) => {
                    if (body.label === 'wall') {
                        Body.setStatic(body, false);
                    }
                });
            }
        })
    })
}
