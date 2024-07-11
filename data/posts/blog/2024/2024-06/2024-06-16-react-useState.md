# useState

`useState`는 초기값을 매개변수로 받고, `[value, setState]` 형식의 배열을 리턴한다.

```js
function useState(initValue) {
  // do someting
  return [value, setState];
}
```

#### [객체도 가능할텐데 배열의 구조 분해 할당을 사용한 이유]

우리가 `useState`를 사용할 때, 아래 코드처럼 그 `state`에 어울리는 이름을 붙여서 사용한다.

```js
const [userName, setName] = useState("");
```

이게 가능한 이유는 배열은 속성 이름이 아닌 인덱스 위치로 구조 분해 할당이 가능하기 때문이다. 첫 번째, 두 번째 요소가 무슨 이름으로 지정되든 상관없이 배열에서는 0번째, 1번째 값을 반환한다. 반면, 객체로 구조 분해 할당을 실행하면 리턴 문에서 지정한 `key, value` 형태를 그대로 유지해야 한다.

```js
function useState(initValue) {
  // do someting
  return { value, setState };
}

const { value, setState } = useState("");
```

이렇게 되면 우리는 매번 아래처럼 이름을 재할당해줘야 한다.

```js
function useState(initValue) {
  // do someting
  return { value, setState };
}

const { value: userName, setState: setUserName } = useState("");
```

이러한 불필요한 작업 없이 배열을 통해 값을 받아서 사용하는 것이다.

다시 돌아와서, 받은 초기값으로 `value`를 지정하고 `setState`에는 새로운 값이 들어오면 기존 `value`에 할당하는 방식일 것이다.

```js
function useState(initValue) {
  let value = initValue;

  function setState(newValue) {
    value = newValue;
  }

  return [value, setState];
}
```

이제 이렇게 동작이 되는지 컴포넌트를 만들어서 확인해보자.

```js
function Component() {
  const [number, setNumber] = useState(0);

  return {
    onClick: () => {
      setNumber(1);
    },
    render: () => {
      console.log(number); // 0 0
    },
  };
}

const A = Component();

A.render();
A.onClick();
A.render();
```

`onClick`을 실행했음에도 여전히 0이 출력되는 것을 볼 수 있다. 이유는 `const [number, setNumber] = useState(0)`에서 이미 초기값 0이 할당된 상태가 `Component`에 할당되었기 때문이다. 그래서 `setNumber`로 새로운 값을 전달해도 setNumber 안에서는 바뀐 값으로 보일지라도 `Component`의 `number`에는 새로 업데이트된 값을 반영할 방법이 없다.

그렇다면 아래처럼 `value`에 대해서도 함수로 만들면 어떨까?

```js
function useState(initValue) {
  let value = initValue;

  function state() {
    return value;
  }

  function setState(newValue) {
    value = newValue;
  }

  return [state, setState];
}
```

```js
function Component() {
  const [number, setNumber] = useState(0);

  return {
    onClick: () => {
      setNumber(1);
    },
    render: () => {
      console.log(number()); // 0 1
    },
  };
}

const A = Component();

A.render();
A.onClick();
A.render();
```

업데이트된 값으로 출력되는 것을 확인할 수 있다. 하지만 `state()` 이런 함수 형식으로 사용하는 것은 우리가 아는 React 방식이 아니다. 이것을 개선해보자.

우리가 보통 React의 상태 변경이 생기면 무슨 일이 일어나는가? 리렌더가 일어난다. 리렌더가 일어나는 이유는 바뀐 상태를 화면에 업데이트하기 위함이다. 이를 이용해 아래처럼 코드를 바꿔보자.

우선 React 구조와 같이 `React`라는 즉시 실행 함수를 만들고 리턴 값으로 위에서 만든 `useState`를 그대로 옮긴다. 그리고 이 상태 값을 기억할 수 있도록 `React`에 `value` 변수를 선언하고 이를 클로저로 적용한다. 기존에 `value` 값이 있으면 `value`를 가지고, 없으면 `initValue`가 할당되도록 해준다.

```js
const React = (function () {
  let _value;

  return {
    useState: (initValue) => {
      _value = _value || initValue;

      function setState(newValue) {
        _value = newValue;
      }

      return [_value, setState];
    },
  };
})();
```

그리고 이제 `render` 메서드를 추가해서 업데이트된 상태로 `state`가 반환되도록 적용한다. `render` 메소드는 이름과 의미 그대로 컴포넌트를 받아서 렌더를 시켜준다.

받아온 컴포넌트를 실행시키는데, 이게 렌더(두 번째부터는 리렌더)를 시키는 동작이다. 컴포넌트를 실행시키면 `React` 내부의 `_value`가 다시 할당되는데 이때 `setState`를 통해 업데이트된 React 내부의 `_value`로 업데이트할 수 있다.

```js
const React = (function () {
  // ...
  return {
    render: (component) => {
      const Component = component();
      Component.render();
      return Component;
    },
    // ...
  };
})();
```

아래 코드를 다시 실행시키면 이제 함수 호출처럼 `value`를 부르지 않아도 초기값과 업데이트된 값으로 `0, 1`이 출력되는 것을 볼 수 있다.

```js
function Component() {
  const [number, setNumber] = React.useState(0);

  return {
    onClick: () => {
      setNumber(1);
    },
    render: () => {
      console.log(number); // 0 1
    },
  };
}

let App;
App = React.render(Component);
App.onClick();
App = React.render(Component);
```

하지만 만약 여기서 다른 `state`를 추가하면 어떻게 될까?

```js
function Component() {
  const [number, setNumber] = React.useState(0);
  const [string, setString] = React.useState("Hello");

  return {
    onClick: () => {
      setNumber(1);
      setString("Soyoung");
    },
    render: () => {
      console.log({ number, string });
      // { number: 0, string: 'Hello' }  { number: 'Soyoung', string: 'Soyoung' }
    },
  };
}

let App;
App = React.render(Component);
App.onClick();
App = React.render(Component);
```

위 주석처럼 결과가 정상적으로 동작하지 않는다. 왜냐하면 우리가 만든 `React`에서는 `setState`를 사용했을 때 첫 번째 선언한 `useState`의 `setState`인지 아니면 두 번째 선언한 `useState`의 `setState`인지 알 수 없기 때문에 마지막에 선언된 `setState`를 기준으로 상태가 업데이트되기 때문이다.

이제 이를 위해 인덱스를 이용해서 훅에 대한 구분을 넣어준다. `React` 안에 `hooks` 배열을 만들고 컴포넌트에서 훅을 호출할 때마다 `currentIndex`가 증가되도록 한다.

```js
const React = (function () {
  const hooks = [];
  let currentIndex = 0;

  return {
    render: (component) => {
      const Component = component();
      Component.render();
      currentIndex = 0;
      return Component;
    },
    useState: (initValue) => {
      const thisHookIndex = currentIndex;
      hooks[thisHookIndex] = hooks[thisHookIndex] || initValue;

      function setState(newValue) {
        hooks[thisHookIndex] = newValue;
      }

      return [hooks[currentIndex++], setState];
    },
  };
})();
```

그리고 이제 다시 실행해보면 정상적으로 고유의 `state`마다 값이 업데이트되고 출력되는 것을 볼 수 있다.

```js
function Component() {
  const [number, setNumber] = React.useState(0);
  const [string, setString] = React.useState("Hello");

  return {
    onClick: () => {
      setNumber(1);
      setString("Soyoung");
    },
    render: () => {
      console.log({ number, string });
      // { number: 0, string: 'Hello' }  { number: 1, string: 'Soyoung' }
    },
  };
}

let App;
App = React.render(Component);
App.onClick();
App = React.render(Component);
```

## 마치면서

위 코드는 리액트가 이렇게 실제로 작동한다는 것은 아니며, 이런 식으로 동작하지 않을까 예상한 것이다. 실제 `useState`와 관련된 React 소스 코드는 [이곳](https://github.com/facebook/react/blob/5f06576f51ece88d846d01abd2ddd575827c6127/packages/react-reconciler/src/ReactFiberHooks.js#L339)에서 볼 수 있는데, 위 예시처럼 단순하게 `hooks` 배열을 정의하는 것이 아닌 `Dispatcher` 객체를 이용해 훅 함수를 공유하는 방식이다.

또한 훅은 각 훅의 상태와 작업 상태를 순차적으로 처리하기 위해 위 예시처럼 단순히 인덱스 개념이 아닌 큐를 이용해 디스패치된 액션을 큐에 저장한 다음 이를 처리하여 새로운 상태를 생성한다.

개념을 전부 이해하지는 못했지만, 일상처럼 사용하는 `useState`에 대한 내부 구현을 고민하고 싶었다. 이 다음 포스트에서도 React 훅에 관련된 내부 구현을 작성하면서 좀 더 깊게 이해하고 싶다.

## 참고자료

- [Under the hood of React's hooks system](https://the-guild.dev/blog/react-hooks-system#state-hooks)
- [ReactFiberHooks](https://github.com/facebook/react/blob/5f06576f51ece88d846d01abd2ddd575827c6127/packages/react-reconciler/src/ReactFiberHooks.js#L339)
- [Deep dive: How do React hooks really work?](https://www.netlify.com/blog/2019/03/11/deep-dive-how-do-react-hooks-really-work/)
