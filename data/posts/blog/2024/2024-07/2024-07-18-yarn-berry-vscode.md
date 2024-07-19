# Yarn berry PnP 와 VSCode SDKs

Yarn의 PnP로 개발하면서 React 관련 라이브러리들을 모두 설치했음에도 아래와 같은 에러가 계속 발생했다.

![JSX.IntrinsicElements error](/public/images/blog/2024/2024-07/error-jsx-intrinsicElements.png)

또한 다른 모듈들도 불러올 수 없는 문제가 생겼다.

![Other modules error](/public/images/blog/2024/2024-07/error-vanilla-extract.png)

관련 모듈을 잘못 설치했다고 생각해서 모두 삭제하고 다시 설치한 후 VSCode를 다시 켜봤지만 소용이 없었다.

에러 설명을 그대로 복사해서 검색해보니 아래와 같은 스택오버플로우 글을 발견했다.

[JSX element implicitly has type 'any' because no interface 'JSX.IntrinsicElements' exists.ts(7026)](https://stackoverflow.com/questions/76090683/jsx-element-implicitly-has-type-any-because-no-interface-jsx-intrinsicelement)

그 중 이런 답변이 있었다.

> The new Yarn PnP paradigm will install modules in a different folder and thus @types/react and @types/react-dom will not be found by tsserver.
To fix this without reverting to node_modules, you have to install Yarn Editor SDKs which are meant to resolve this problem for specific editors (currently Vim and VSCode).
If your editor is not listed, then install the base SDK and manually configure your editor's tsserver to run from .Yarn/sdks/typescript/bin/tsserver.

즉, Yarn PnP는 모듈을 다른 폴더에 설치하기 때문에 `@types/react`와 `@types/react-dom`이 tsserver에서 발견되지 않을 수 있기 때문에 이를 해결하려면 Yarn Editor SDK를 설치하거나, 편집기에서 tsserver를 수동으로 `.Yarn/sdks/typescript/bin/tsserver`에서 실행하도록 설정해야 한다고 한다.

## Yarn berry
Yarn은 npm과 마찬가지로 자바스크립트 패키지를 관리하고 설치하는 도구다. PnP, cache, 워크스페이스 등 특징을 가지고 있지만, 이번 문제는 PnP와 관련된 것이므로 PnP에 집중해서 살펴보겠다.

### Plug'n'Play
PnP는 사용자가 하드웨어 장치를 컴퓨터에 연결했을 때 시스템이 이를 자동으로 인식하고 필요한 드라이버를 설치하여 추가 설정 없이 즉시 사용할 수 있게 해주는 기술이다. 예를 들어, 와콤 타블렛을 컴퓨터에 연결했을 때 바로 드라이버 설치 안내 프로그램이 뜨면서 설치가 끝나면 바로 사용할 수 있는 경우가 있다. 또 하나 유명한 일화로 Window98 신기능으로 나온 PnP 시연에서 [빌게이츠 일화](https://namu.wiki/w/%EB%B9%8C%20%EA%B2%8C%EC%9D%B4%EC%B8%A0%EC%9D%98%20%EA%B5%B4%EC%9A%95)도 있었다.

다시 생각하면 PnP는 "사용자가 신경 쓰지 않아도 자동으로 필요한 것들을 설치해주는" 것이 목적이라고 본다. 이러한 개념을 가지고 Yarn Berry에서 PnP 방식은 개발자가 패키지를 설치할 때 의존성 충돌이나 중복 설치 문제를 자동으로 해결해주려는 목적을 담고 있다. 

또한 PnP가 설치 시간을 단축시키고 시스템 자원을 효율적으로 사용하듯이 Yarn Berry도 그 장점을 가져와 설치 속도가 빨라지고 디스크 사용량을 줄인다.

### .pnp.cjs 파일
각 패키지의 위치, 버전, 의존성 정보를 포함한다. Yarn은 이 정보를 사용하여 어떤 패키지가 어디에 위치해 있고, 어떤 버전을 사용해야 하는지를 결정한다.

### .pnp.loader.mjs
`.pnp.cjs` 파일을 기반으로 Node.js 환경에서 패키지를 어떻게 찾고 로드할지를 정의한 스크립트다. 따라서 `node_modules` 폴더가 없어도 패키지를 로드할 수 있다.

이 로더 파일 `.pnp.loader.mjs`은 프로젝트의 종속성 트리에 대한 모든 정보를 포함하여 패키지의 위치를 디스크에 알려주고, `require` 및 `import` 호출을 어떻게 해결할지 알려준다.

## VSCode와 Editor SDKs
Yarn 공식 문서에 따르면, VSCode와 같은 대부분의 IDE는 로더에 대한 고려 없이 TypeScript와 같은 패키지를 실행하기 때문에 PnP를 사용할 때 TypeScript가 제대로 실행되려면 SDK 설정이 필요하다고 한다.

즉, VSCode와 같은 대부분의 IDE는 Node.js 런타임 자체에 내장된 기본 모듈 로더를 사용하여 모듈을 찾고 로드하기 때문에 `.pnp.loader.mjs`처럼 우리가 커스텀으로 만든 로더를 사용하면 제대로 동작하지 않을 수 있다. TypeScript가 제대로 동작하기 위해선 SDK 설정이 필요하다.

Editor SDKs 는 Software Development Kits 로 우리가 코드 편집기에서 사용할 수 있는 개발 도구와 라이브러리 모음을 의미한다. VSCode 에 sdk 중에서 TypeScript SDK 가 있는데 TypeScript 프로젝트를 위한 자동 완성, 타입 검사, 리팩토링 도구 등을 제공한다. 이게 바로 기본 내장된 모듈과 커스텀으로 설정한 모듈에서 부딪히는 문제다.

## 문제 해결
제대로 동작하기 위해 SDK 설정은 `yarn dlx @yarnpkg/sdks` 명령어를 사용해서 생성할 수 있다.

이 명령어를 실행하면 루트 `package.json` 의 내용을 확인하여 필요한 SDK (Typescript, ESLint 등을) 를 알아서 자동으로 다운로드하고 설정해준다. 그리고 이 내용은 `vscode > settings.json` 에 추가된다.

```json
  "eslint.nodePath": ".Yarn/sdks",
  "typescript.tsdk": ".Yarn/sdks/typescript/lib",
```

위 명령어를 입력한 후 바로 VSCode에서 실행되지는 않는다. 공식문서에 따르면 VSCode 는 이러한 설정이 바로 바뀌면 사용자에게 혼란을 줄 수 있기 때문에 안전상의 이유로 사용자가 직접 명시적으로 활성화하는 추가 작업을 요구한다고 한다.

아래처럼 아무 TypeScript 파일에서 `Ctrl+Shift+P`를 누르고 `"TypeScript 버전 선택"`을 선택한다.

![Select typescript version](/public/images/blog/2024/2024-07/select-typescript-version.png)

그리고 `"작업 영역 버전 사용"`을 누른다.

![Select typescript version](/public/images/blog/2024/2024-07/select-workspace-version.png)

이렇게 명시적으로 커스텀 로더를 사용하겠다고 지정하면 이제 VSCode가 기본 모듈이 아닌 커스텀 로더를 사용하여 프로젝트를 실행할 수 있다.

## 마치면서
그동안 npm과 pnpm을 사용해왔기에 Yarn Berry는 처음 써봤다. 토이 프로젝트를 진행하면서 배우자는 마음으로 Yarn Berry를 사용했는데, 특징을 제대로 이해하지 않고 사용하다 보니 "이게 왜 안되지?" 하면서 막히는 부분이 많았다. 각 패키지 매니저마다 다른 패러다임이 있으니, 그 특징을 먼저 공부하고 사용했어야 했다. 하지만 이러한 에러를 통해 배우는 과정 역시 더 깊이 이해하고 기억에 남는 것 같다.


## 참고자료
- https://Yarnpkg.com/getting-started/editor-sdks
- https://Yarnpkg.com/features/pnp
- https://namu.wiki/w/Plug%20%26%20Play
- https://toss.tech/article/node-modules-and-Yarn-berry
- https://yceffort.kr/2022/05/npm-vs-Yarn-vs-pnpm