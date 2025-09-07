const bindings = {
  left: ["ArrowLeft", "KeyA"],
  right: ["ArrowRight", "KeyD"],
  up: ["ArrowUp", "KeyW"],
  down: ["ArrowDown", "KeyS"],
  action: ["Space"],
};
type Action = keyof typeof bindings;
const bindingMap: { [key: string]: Action } = {};
for (let binding in bindings) {
  for (let key of bindings[binding as Action]) {
    bindingMap[key] = binding as Action;
  }
}

window.addEventListener("keydown", (event) => {
  if (bindingMap[event.code]) {
    controls[bindingMap[event.code]] = Date.now();
    keyEvents.push([bindingMap[event.code], Date.now()]);
  }
});
window.addEventListener("keyup", (event) => {
  if (bindingMap[event.code]) {
    controls[bindingMap[event.code]] = 0;
  }
});

export const controls = {
  left: 0,
  right: 0,
  up: 0,
  down: 0,
  action: 0,
};

export const keyEvents: [keyof typeof bindings, number][] = [];
