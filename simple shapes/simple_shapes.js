// simple play with matter.js

const {Engine, Render, Runner, World, Bodies, MouseConstraint, Mouse} = Matter;

// creates basic world with 800 x 600 grid
const width = 800;
const height = 600;
const engine = Engine.create();
const {world} = engine;
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
World.add(world, MouseConstraint.create(engine, {mouse: Mouse.create(render.canvas)}))

// make/add boundaries
const boundaries = [
    Bodies.rectangle(400, 0, 800, 20, {
        isStatic: true,
    }),
    Bodies.rectangle(400, 600, 800, 20, {
        isStatic: true,
    }),
    Bodies.rectangle(0, 300, 20, 600, {
        isStatic: true,
    }),
    Bodies.rectangle(800, 300, 20, 600, {
        isStatic: true,
    }),
]
World.add(world, boundaries);

// add random shapes
for (let i=0; i < 25; i++){
    if (Math.random() > 0.5) {
        World.add(world, Bodies.rectangle(Math.random() * width, Math.random() * height, Math.random() * 50, Math.random() * 50))
    } else {
        World.add(world, Bodies.circle(Math.random() * width, Math.random() * height, Math.random() * 40))

    }
}
