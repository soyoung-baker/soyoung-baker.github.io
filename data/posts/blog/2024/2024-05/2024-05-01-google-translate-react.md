# 리액트와 구글 번역기 충돌로 인한 에러 해결 방법

최근 유저가 페이지를 이동하다가 갑자기 아래와 같은 에러 문구로 에러 페이지가 뜬다는 보고가 들어왔다.

```bash
NotFoundError

Failed to execute 'insertBefore' on 'Node': The node before which the new node is to be inserted is not a child of this node.
```

관련해서 검색을 해보니 리액트로 개발된 페이지에서 구글 번역기를 사용할 경우 생기는 문제였다. 구글과 리액트에서도 이미 이 문제에 대해서 알고 있는 상태이지만 리액트와 구글, 두 팀은 이 문제를 고칠 생각은 없어 보였다.

- https://github.com/facebook/react/issues/11538#issuecomment-390386520
- https://issues.chromium.org/issues/41407169

위 링크 내용을 요약하면 구글 번역기가 동작하면서 번역된 내용이 담긴 텍스트 노드를 `<font>` 태그에 감싸는데 이때 리액트는 더이상 자식 요소가 아닌 텍스트 노드에 대한 참조를 유지해서 생긴 문제다.

1. 구글 번역기를 사용하면 텍스트 노드는 `<font>` 태그로 감싸진다.
2. 리액트는 더이상 자식 요소가 아닌 텍스트 노드를 참조를 계속 유지한다.

## insertBefore

문제를 분석하기 전에 `insertBefore` 메소드에 대해서 알아보자. `insertBefore` 은 특정 노드를 참조 노드의 앞에 사용될 때 사용되는 메소드다.

[mdn - Node: insertBefore() method](https://developer.mozilla.org/en-US/docs/Web/API/Node/insertBefore)

```js
parentNode.insertBefore(newNode, referenceNode);
```

- `parentNode`: 자식을 삽입할 부모 노드
- `newNode`
  - 삽입할 새로운 노드
  - 이미 DOM 에 존재하는 노드라면 현재 위치에서 제거되고 새로운 위치에 삽입된다.
- `referenceNode`:
  - 참조 노드, 이 노드 앞에 `newNode` 가 삽입된다.
  - 만약 `null` 일 경우, `newNode` 는 부모노드의 자식 목록의 마지막에 추가된다.

위 특징대로 간단하게 사용법을 익히면 아래와 같다.

```html
<div id="parentElement">
  <span id="childElement">안녕!</span>
</div>

<script>
  const newNode = document.createElement("span");
  newNode.textContent = "하!하!하! ";

  const parenElement = document.getElementById("parentElement");
  const childElement = document.getElementById("childElement");

  parenElement.insertBefore(newNode, childElement);
</script>
```

실행을 해보면 `'하!하!하! 안녕!'` 이 출력되는 것을 확인할 수 있다. 이때 `childElement`가 `undefined`면 `null`로 취급되면서 부모의 마지막 자식으로 추가되지만, 객체로 해석할 수 없는 `"undefined"`와 같은 문자열을 넘기면 TypeError가 발생한다.

`insertBefore`를 사용할 때 생길 수 있는 또 하나의 에러는 참조 노드가 부모 노드의 자식 노드가 아닌 경우에 발생한다.

```html
<div id="parentElement">
  <span id="childElement">안녕!</span>
  <span>
    <span id="notChildElement">안녕!</span>
  </span>
</div>

<script>
  const newNode = document.createElement("span");
  newNode.textContent = "하!하!하! ";

  const parenElement = document.getElementById("parentElement");
  const childElement = document.getElementById("notChildElement");

  parenElement.insertBefore(newNode, childElement);

  // 실행결과 콘솔 에러로 (index):30 Uncaught DOMException: Failed to execute 'insertBefore' on 'Node': The node before which the new node is to be inserted is not a child of this node. 가 뜨는 것을 확인할 수 있다.
</script>
```

이 에러 문구가 이번에 발견한 에러 문구와 똑같다.

## 구글 번역기를 사용하면 텍스트 노드는 <font> 태그로 감싸진다.

예제로 실행할 코드는 다음과 같다.

```jsx
function App() {
  const [isVisible, setIsVisible] = useState(false);

  const handleClick = () => {
    setIsVisible((prev) => !prev);
  };

  return (
    <div className="App">
      <button onClick={handleClick}>Click Button</button>
      <h1>Find the key 🗝️</h1>
      <p>
        {isVisible && <span>Found it!</span>}
        🗝️
      </p>
    </div>
  );
}
```

크롬 브라우저를 사용하면 오른쪽 위에 있는 번역기 버튼을 통해 번역 설정을 지정할 수 있다.

```html
<div id="root">
  <div class="App">
    <button>Click Button</button>
    <h1>Find the key 🗝️</h1>
    <p>🗝️</p>
  </div>
</div>
```

번역이 실행되면 아래와 같이 기존 마크업에 `font` 태그와 `'goog-gt-tt'` id 를 가진 `div` 태그가 추가된 것을 볼 수 있다.
![Click the Translate to Korean](/public/images/blog/2024/2024-05/click-korean.png)

```html
<div id="root">
  <div class="App">
    <button>
      <font style="vertical-align: inherit;">
        <font style="vertical-align: inherit;">버튼을 클릭하세요</font>
      </font>
    </button>
    <h1>
      <font style="vertical-align: inherit;">
        <font style="vertical-align: inherit;">열쇠를 찾아보세요 🗝️</font>
      </font>
    </h1>
    <div></div>
  </div>
</div>
<div id="goog-gt-tt">...</div>
```

중요한 것은 이때 추가된 `<font>` 태그는 리액트 가상 돔에 반영되지 않는다. `<font>` 태그 추가가 리액트 렌더링을 발생시키지 않기 때문에 현재 보이는 DOM과 가상 DOM은 싱크가 맞지 않은 상태다.

## 리액트는 더이상 DOM 트리에 존재하지 않는 텍스트 노드를 참조를 계속 유지한다.

```jsx
<div className="App">
  <button onClick={handleClick}>Click Button</button>
  <h1>Find the key 🗝️</h1>
  <p>
    {isVisible && <span>Found it!</span>}
    🗝️
  </p>
</div>
```

그럼 위와 같이 DOM과 가상 DOM이 서로 다른 상태에서 버튼을 클릭해 클릭 이벤트를 발생시키면 어떻게 될까? `isVisible`이 `true`로 변경되면서 `<span>` 태그가 `<p>` 태그의 제일 앞부분에 들어가게 된다. 즉 `"🗝️"` 텍스트 앞에 들어가야 하므로 아래 그림과 같이 동작해야 한다.

![Expected insertBefore operation](/public/images/blog/2024/2024-05/insertBefore.png)

하지만 실제 DOM 상태는 아래와 같다. 따라서 리액트의 가상 DOM은 더 이상 부모의 자식이 아닌 `"🗝️"` 텍스트 노드를 여전히 참조하고 있는 상태에서 `insertBefore`의 참조 노드로 사용해 동작시킨다. 그러면 부모의 자식 노드가 아닌 것을 참조 노드로 사용했기 때문에 아래 같은 에러가 발생한다.

![Actual insertBefore operation](/public/images/blog/2024/2024-05/insertBefore-error.png)

만약 아래처럼 유일한 자식이었을 경우 오류를 발생시키지 않는다. 왜냐면 `insertBefore`의 참조 노드는 `null` 값이기 때문에 `<font>` 태그와 관련 없이 새롭게 추가되는 노드는 부모 노드의 마지막 자식으로 들어가기 때문이다.

```jsx
// p 태그의 유일한 자식이기 때문에 에러가 발생하지 않는다.
<div className="App">
  <button onClick={handleClick}>Click Button</button>
  <h1>Find the key 🗝️</h1>
  <p>{isVisible && <span>Found it!</span>}</p>
</div>
```

혹은 `"🗝️"` 텍스트 노드를 `<span>` 태그 같은 HTML 태그로 감싸줘도 에러가 발생하지 않는다. `<font>` 태그가 감싸는 것은 텍스트 노드이기 때문에 아래 같은 구조로 `<span>` 태그 안에서 `<font>` 태그가 감싸주면서 `insertBefore`의 참조 노드는 가상 DOM과 실제 DOM이 같은 `<span>`을 바라보고 있어서 에러가 발생하지 않는다.

```jsx
<div className="App">
  <button onClick={handleClick}>Click Button</button>
  <h1>Find the key 🗝️</h1>
  <p>
    {isVisible && <span>Found it!</span>}
    <span>🗝️</span>
  </p>
</div>
```

```jsx
<div id="root">
  <div class="App">
    <button>
      <font style="vertical-align: inherit;">
        <font style="vertical-align: inherit;">버튼을 클릭하세요</font>
      </font>
    </button>
    <h1>
      <font style="vertical-align: inherit;">
        <font style="vertical-align: inherit;">열쇠를 찾아보세요 🗝️</font>
      </font>
    </h1>
    <div>
      <p>
        <span>
          <font style="vertical-align: inherit;">
            <font style="vertical-align: inherit;">그것을 발견!</font>
          </font>
        </span>
        // 번역기 실행 후 p 태그의 자식인 span 은 여전히 자식으로 존재한다
        <span>
          <font style="vertical-align: inherit;">
            <font style="vertical-align: inherit;">🗝️</font>
          </font>
        </span>
      </p>
    </div>
  </div>
</div>
```

## 해결방법

구글에 'react google translate error'를 검색하면 해결 방법들이 나오는데 대표적으로 아래와 같다.

### 1. (마지막 예시처럼) 텍스트 노드를 span 같은 태그로 감싸준다.

이런 에러를 겪는 사람들을 위해 만들어진 여러 라이브러리도 있었는데 그중 [sayari 의 린트 플러그인](https://github.com/sayari-analytics/eslint-plugin-sayari)에서 제공해주는 기능 중 `no-unwrapped-jsx-text` 이 있는데 부모의 유일한 자식이 아닌 텍스트 노드가 태그에 감싸져 있지 않는 파일들을 모두 찾아서 `span` 태그를 자동으로 감싸준다.

하지만 이 방법을 사용할 경우 올바르지 않은 마크업이 방대하게 생겨버리고 코드 가독성 최악을 경험할 수 있었다.

### 2. translate="no", notranslate

구글 번역기 기능을 막아버리는 방법도 있다. 하지만 무조건 번역을 막는 것이 좋은 해결 방법은 아니고, 글로벌 서비스를 제공하는 회사라면 이 방법은 쓸 수 없다.

### 3. 에러가 발생하면 사용자에게 번역을 잠시 꺼달라는 문구를 제공한다.

현재 프로젝트 우선순위들을 고려했을 때, 그리고 당장 이 문제를 고치기 어렵다는 점, 마지막으로 빈번하게 생기는 문제가 아닌 문제가 생겼던 페이지에서 또 다시 에러를 재현하기가 어려울 정도로 가끔 나타나는 문제인 점을 고려해서 이 에러가 생기면 사용자에게 적어도 번역기를 켰기 때문에 생긴 문제임을 알리고 번역기를 잠시 끄고 다시 시도해달라는 문구를 보여주기로 했다.

### 4. (마음속의 방법: 구글이나 리액트가 고쳐주길 기도한다.)

[Chromium](https://issues.chromium.org/issues/41407169) 에 'I am impact'에 투표하고 알림 설정을 해뒀는데, 후에 이 알림이 울리는 날이 올지는 모르겠다.
