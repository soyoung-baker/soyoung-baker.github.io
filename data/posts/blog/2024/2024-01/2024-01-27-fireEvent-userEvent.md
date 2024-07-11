# userEvent vs. fireEvent

## React Testing Library 라이브러리

리액트 테스팅 라이브러리는 UI 컴포넌트를 테스트하기 위한 도구다. 공식 문서의 소개글을 토대로 특징을 설명하면 테스트가 제품의 실제 사용 방식과 유사할수록, 테스트 결과에 대한 확신이 높아진다고 한다. 즉, 사용자가 애플리케이션을 실제로 사용하는 방식과 유사하게 테스트를 진행하면, 개발자는 예상대로 제품이 동작하는지 확인할 수 있으며, 동시에 사용자가 서비스를 이용하면서 예상치 못한 버그를 최소화할 수 있다.

테스팅 라이브러리는 DOM 노드를 쿼리하고 상호작용할 수 있는데 주로 두 가지 함수를 사용해서 테스트를 수행한다.

- [Testing Library - fireEvent](https://testing-library.com/docs/dom-testing-library/api-events)
- [Testing Library - userEvent](https://testing-library.com/docs/user-event/intro)

공식문서에서도 `fireEvent` 를 사용하기 보다 `userEvent` 를 사용하는 것을 권장하는데 두 함수의 차이는 `fireEvent` 는 DOM 이벤트를 발송하는 데 반해, `userEvent` 는 여러 이벤트를 발생시키고 추가적인 확인을 수행할 수 있는 완전한 상호 작용을 시뮬레이션한다.

예시를 떠올리면 클릭 이벤트를 테스트할 때 `fireEvent` 는 단순히 `dispatchEvent` 를 통해 `click` 이벤트만 발생시키지만 `userEvent` 는 마우스의 이동, 마우스 오버, 클릭 등 과 같이 실제 유저의 행동과 유사하게 처리한다.

## dispatchEvent

`dispatchEvent` 는 사용자 행동에 따라 반응하는 `addEventListener` 와 다르게 사용자의 동작에 반응하지 않고, 코드로 직접 이벤트를 발생시킬 수 있다.

아래 예시 코드는 버튼에 클릭 이벤트 리스너를 등록한 것이다. 따라서 사용자가 직접 버튼을 클릭해야지 `"클릭 🎉"` 텍스트를 볼 수 있다.

```html
<div id="wrap">
  <button id="event-button">버튼</button>
</div>

<script>
  const wrap = document.getElementById("wrap");
  const button = document.getElementById("event-button");

  const newNode = document.createElement("span");
  newNode.textContent = "클릭 🎉";

  button.addEventListener("click", () => {
    wrap.insertBefore(newNode, button);
  });
</script>
```

그러나 아래 예시 코드는 `button` 요소에 클릭 이벤트를 dispatch 해놨기 때문에 사용자가 직접 브라우저에서 클릭하지 않아도 코드가 실행될 때 자동으로 클릭 이벤트가 발생하며 등록한 리스너의 콜백이 실행된다.

```html
<div id="wrap">
  <button id="event-button">버튼</button>
</div>

<script>
  const wrap = document.getElementById("wrap");
  const button = document.getElementById("event-button");

  const newNode = document.createElement("span");
  newNode.textContent = "클릭 🎉";

  button.addEventListener("click", () => {
    wrap.insertBefore(newNode, button);
  });

  const event = new Event("click", { cancelable: true });
  button.dispatchEvent(event);
</script>
```

이 `dispatchEvent` 를 이용해 테스팅 라이브러리의 `fireEvent` 가 동작한다.

## fireEvent 와 userEvent 의 내부 구현 살펴보기

`testing-library` 은 오픈 소스이므로 자유롭게 살펴볼 수 있는데, `fireEvent` 의 코드를 살펴보면 `element` 에 이벤트를 `dispatchEvent` 하는 것을 볼 수 있다.
즉, `fireEvent` 는 DOM 이벤트를 사용자 관점이 아닌 좀 더 프로그래밍 측면으로 발생시키기 때문에 버튼을 클릭하기 위해서 마우스의 이동 같은 것을 표현하지 않는다.

```js
// dom-testing-library/src/events.js

function fireEvent(element, event) {
  return getConfig().eventWrapper(() => {
    if (!event) {
      throw new Error(
        `Unable to fire an event - please provide an event object.`
      );
    }
    if (!element) {
      throw new Error(
        `Unable to fire a "${event.type}" event - please provide a DOM element.`
      );
    }
    return element.dispatchEvent(event);
  });
}

// ...
```

`userEvent` 의 `click` 에 관한 코드를 살펴보면 `fireEvent` 처럼 단순히 `dispatchEvent` 로 처리하지 않고 dispatch 에 대한 동작을 재정의해서 클릭 동작을 처리한다.

`userEvent.click(element)` 형태로 사용하기 위한 API 를 정의하고, `click` 함수는 전달받은 `element` 를 `pointer input` 으로 정보를 추가해 `pointer` 함수를 호출한다.

```ts
// user-event/src/setup/api.ts

import { click } from "../convenience";
//...

export const userEventApi = {
  click,
  // ...
};
```

```ts
// user-event/src/convenience/click.ts
export async function click(this: Instance, element: Element): Promise<void> {
  const pointerIn: PointerInput = [];
  if (!this.config.skipHover) {
    pointerIn.push({ target: element });
  }
  pointerIn.push({ keys: "[MouseLeft]", target: element });

  return this.pointer(pointerIn);
}
```

`pointer` 은 `PointerHost` 클래스를 통해 생성되는데, 이 클래스는 마우스나 디바이스 터치에서 일어나는 포인터 이벤트를 만들어낸다. 즉, 사용자 마우스로 클릭을 한다면 이 포인터 호스트 클래스를 통해 그 마우스가 움직임과 동작을 정의해둔 `Buttons` 클래스와 `Mouse` 클래스를 통해 처리한다. 이러한 내용이 `userEvent` 를 사용했을 때 사용자가 애플리케이션을 사용하는 방식과 유사하게 테스트를 할 수 있도록 해주는 핵심인 것 같다.

```ts
export class PointerHost {
  readonly system: System;

  constructor(system: System) {
    this.system = system;
    this.buttons = new Buttons();
    this.mouse = new Mouse();
  }
  //...
}
```

조금 더 살펴보면 `userEvent.click(button)` 을 사용했을 때 버튼을 전달 후 유저 이벤트 클릭을 실행하겠지라는 것 처럼 내부적으로는 `getMouseEventButton` 함수에서 버튼 요소를 받아 버튼에 대한 식별을 정의한 후, 마우스 클래스에선 `down` 메소드를 통해 버튼이 있고, 비활성화가 아닌 경우, 오른쪽 클릭 등의 마우스 동작을 처리한다.

```ts
// user-event/src/system/pointer/buttons.ts
export function getMouseEventButton(button?: MouseButton): number {
  button = getMouseButtonId(button);
  if (button in MouseButtonFlip) {
    return MouseButtonFlip[button as keyof typeof MouseButtonFlip];
  }
  return button;
}

// user-event/src/system/pointer/mouse.ts
export class Mouse {
  // ...
  down(instance: Instance, keyDef: pointerKey, pointer: Pointer) {
    const button = this.buttons.down(keyDef);

    if (button === undefined) {
      return;
    }

    const target = this.getTarget(instance);
    this.buttonDownTarget[button] = target;
    const disabled = isDisabled(target);
    const init = this.getEventInit("mousedown", keyDef.button);
    if (disabled || instance.dispatchUIEvent(target, "mousedown", init)) {
      this.startSelecting(instance, init.detail as number);
      focusElement(target);
    }
    if (!disabled && getMouseEventButton(keyDef.button) === 2) {
      instance.dispatchUIEvent(
        target,
        "contextmenu",
        this.getEventInit("contextmenu", keyDef.button, pointer)
      );
    }
  }
}
```

`dispatchUIEvent` 함수는 마우스 이벤트 타입으로 구분한 후 `createEvent` 를 통해 이벤트 생성하는데, `window.PointerEvent` 면 `PointerEvent` 클래스가 생성된다.

```ts
// user-event/src/event/dispatchEvent.ts
export function dispatchUIEvent<K extends EventType>(
  this: Instance,
  target: Element,
  type: K,
  init?: EventTypeInit<K>,
  preventDefault: boolean = false
) {
  if (isMouseEvent(type) || isKeyboardEvent(type)) {
    init = {
      ...init,
      ...this.system.getUIEventModifiers(),
    } as EventTypeInit<K>;
  }

  const event = createEvent(type, target, init);

  return dispatchEvent.call(this, target, event, preventDefault);
}

// user-event/src/event/createEvent.ts
const PointerEvent =
  window.PointerEvent ?? class PointerEvent extends MouseEvent {};
```

이러한 내부 구현으로 `userEvent` 가 사용자가 제품을 이용하는 것처럼 테스트를 할 수 있던 것이다.

## 마치면서

위에서 이해한 것처럼, 마지막으로 `fireEvent` 와 `userEvent` 를 사용해 테스트를 진행하면서 정말로 설명된 특징대로 동작하는지 확인해보며 글을 마치려고 한다.

보통 버튼을 클릭 하기 위해서는 사용자가 마우스를 버튼 위로 이동시킨다. 이 과정에서 `mouse over`, `mouse move`, `mouse down`, `mouse up`, `click`, `button hover` 등 다양한 동작이 발생한다.

아래 예시 코드는 버튼에 마우스가 올라오면 호버됐다는 클래스가 붙어 배경색이 검정색으로 변하고, 마우스가 떨어지면 클래스가 지워지며 배경색이 분홍색으로 변한다.

```jsx
const Button = styled.button`
  background-color: pink;

  &.hovered {
    background-color: black;
  }
`;

export const ClickEventComponent = () => {
  const [isHover, setIsHover] = useState(false);

  return (
    <Button
      onMouseOver={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      className={isHover ? "hovered" : ""}
    >
      버튼
    </Button>
  );
};
```

이 컴포넌트를 `fireEvent` 를 통한 버튼 클릭 이벤트 테스트를 실행해보면 검정색을 예상했지만 분홍색이라는 실패 보고서가 나온다. `fireEvent` 를 사용하면 `click` 이벤트를 dispatch 하면 단순히 `click` 하나의 동작만 일어나기 때문이다.

```jsx
describe("ClickEventComponent", () => {
  it("fireEvent - mouse over 됐을 때 배경색이 검정색으로 변경된다.", () => {
    render(<ClickEventComponent />);

    const button = screen.getByRole("button");

    fireEvent.click(button);
    expect(button).toHaveStyle("background-color: black");
  });
});
```

```bash

  ● ClickEventComponent › fireEvent - mouse over 됐을 때 배경색이 검정색으로 변경된다.

    expect(element).toHaveStyle()

    - Expected

    - background-color: black;
    + background-color: pink;

```

반면 `userEvent` 로 클릭 이벤트 테스트를 다시 작성해서 테스트를 실행하면 성공 결과가 나온다.

```jsx
describe("ClickEventComponent", () => {
  it("userEvent - mouse over 됐을 때 배경색이 검정색으로 변경된다.", () => {
    render(<ClickEventComponent />);

    const button = screen.getByRole("button");

    userEvent.click(button);
    expect(button).toHaveStyle("background-color: black");
  });
});
```

앞에서 설명한 대로 `userEvent` 가 실제 사용자가 브라우저에서 버튼을 클릭하는 것과 동일하게 상호작용하여 테스트를 제공하기 때문에 단순히 클릭 이벤트만 처리하지 않고 `pointer` 을 통해 `mouse move`, `mouse over` 과 같은 상호작용도 함께 처리가 되기 때문이다.

따라서 `fireEvent` 보다는 `userEvent` 로 작성하는 것이 '사용자가 애플리케이션을 사용하는 방식과 유사하게 테스트' 하려는 목적에 부합한다. 그러나 공식문서에서 적혀있듯 `userEvent` 에 아직까진 구현되지 않은 상호 작용이 있어서 몇몇 테스트는 `fireEvent` 를 사용해야하는 경우도 있다고 한다. 가능하면 `userEvent` 를 사용하면서 테스트를 작성하되 만약 `userEvent` 에서 구현할 수 없는 사용자의 동작이 있다면 이 두 함수의 차이를 인지하면서 `fireEvent` 를 사용해야겠다.

## 참고자료

- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [react-testing-library GitHub](https://github.com/testing-library/react-testing-library)
- [user-event GitHub](https://github.com/testing-library/user-event)
