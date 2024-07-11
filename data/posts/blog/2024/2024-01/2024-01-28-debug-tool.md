# VSCode 에서 타입스크립트 디버깅하기

VSCode에서 타입스크립트로 작성한 코드를 디버그하려고 하면 에러가 발생한다.

```typescript
const blogName: string = "soreung-soreung";

function printBlogURL(name: string): string {
  return `${name}.github.io`;
}

printBlogURL(blogName);
```

![syntax error message](/public/images/blog/2024/2024-01/syntax-error.png)

VSCode에서 타입스크립트 디버그를 어떻게 할 수 있을까?

[공식문서](https://code.visualstudio.com/docs/typescript/typescript-debugging)에는 아래와 같이 적혀있다.

> VS Code has built-in debugging support for the Node.js runtime and can debug JavaScript, TypeScript, or any other language that gets transpiled to JavaScript.

VSCode는 Node.js 런타임에 대한 내장 디버깅 지원을 제공하며 JavaScript, TypeScript 또는 JavaScript로 변환되는 다른 언어를 디버깅할 수 있다.

> Visual Studio Code supports TypeScript debugging through its built-in Node.js debugger and Edge and Chrome debugger.

Visual Studio Code는 내장된 Node.js 디버거와 Edge 및 Chrome 디버거를 통해 TypeScript 디버깅을 지원한다.

1. VSCode는 자바스크립트 런타임 환경에 내장한 디버깅을 지원한다.
2. 즉, 타입스크립트로 작성한 코드는 자바스크립트로 변환된 상태여야 자바스크립트 런타임 환경에 내장한 디버깅을 쓸 수 있다.
3. 타입스크립트 컴파일러를 이용해 현재 파일을 자바스크립트로 변환 후 디버깅하자.

```bash
npx tsc ./contents/codes/2024/2024-01/app.ts
```

![TypeScript code compiled into JavaScript code](/public/images/blog/2024/2024-01/compiled.png)

![Compilation and debug failure](/public/images/blog/2024/2024-01/after-compile-debugging.png)

자바스크립트로 변환된 app.js 파일에 브레이크포인트를 걸어 VSCode의 디버깅을 실행하면 이전에 나왔던 에러 없이 실행이 잘 되는 것을 확인할 수 있다. 당연하다. 자바스크립트 코드를 디버깅하는 것이니깐.

하지만 이런 식으로 타입스크립트 파일을 자바스크립트로 변환한 후 다시 브레이크포인트에 걸어서 실행하는 게 아니라 현재 내가 보고 있는 타입스크립트 파일에서 브레이크포인트를 건 시점에 바로 디버깅을 하고 싶다.

즉, 타입스크립트로 작성된 원본 파일과 변환된 자바스크립트 파일 코드 사이를 연결해주는 도구가 있어서 타입스크립트에서 디버깅을 실행했을 때 해당 코드 정보를 자바스크립트 파일 정보와 연결시켜 디버깅할 수 있도록 만들어주면 좋겠다.

그 도구는 소스맵이 될 수 있다.

> TypeScript debugging supports JavaScript source maps. To generate source maps for your TypeScript files, compile with the --sourcemap option or set the sourceMap property in the tsconfig.json file to true.

타입스크립트 디버깅을 할 때 JavaScript 소스맵을 지원하는데, TypeScript 파일에 대한 소스맵을 생성하려면 `--sourcemap` 옵션으로 컴파일하거나 `tsconfig.json` 파일에서 `sourceMap` 속성을 `true`로 설정하면 된다고 한다.

```bash
npx tsc ./contents/codes/2024/2024-01/app.ts --sourcemap
```

![app.js.map code](/public/images/blog/2024/2024-01/source-map.png)

![Debugging app.ts code](/public/images/blog/2024/2024-01/source-map-debugging.png)

생성한 소스맵 정보를 통해 변환된 자바스크립트 파일에서 다시 브레이크포인트를 걸어서 해야 했던 이전과 달리 `app.ts`에서 바로 브레이크포인트를 걸어 디버깅할 수 있다.

```json
{
  "compilerOptions": {
    "sourceMap": true
  }
}
```

`tsconfig.json`에 `sourceMap` 설정을 `true`로 하면 터미널에 `--sourcemap`을 입력하지 않아도 컴파일할 때 자동으로 소스맵을 생성해준다.

하지만 아직 불편하다.

1. 디버깅을 하고 싶을 때마다 해당 파일을 타입스크립트 파일을 컴파일하는 명령을 터미널에 작성해줘야 한다.
2. 코드를 변경할 때마다 다시 1번 과정을 거쳐야 한다.

디버깅 버튼을 누르는 순간 디버깅 실행 전에 타입스크립트 컴파일을 해주는 방법이 없을까?
이런 불편함을 지나칠리 없는 VSCode는 친절하게 아래 방법을 설명해준다.

> For more advanced debugging scenarios, you can create your own debug configuration launch.json file. To see the default configuration, go to the Run and Debug view (⇧⌘D) and select the create a launch.json file link.

`launch.json` 파일을 통해 디버깅 설정을 할 수 있다고 한다. 기본 설정을 확인하려면 디버깅 실행에서(`⇧⌘D`) `"create a launch.json file"`를 클릭하면 된다.

![Debugging app.ts](/public/images/blog/2024/2024-01/launch-json-file.png)

위에 이미지는 Node.js 디버거에 대한 `launch.json` 파일인데 이제 이것을 [공식문서](https://code.visualstudio.com/docs/typescript/typescript-debugging)에 나온대로 아래처럼 설정하면 된다.

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch Program",
      "program": "${workspaceFolder}/helloworld.ts",
      "preLaunchTask": "tsc: build - tsconfig.json",
      "outFiles": ["${workspaceFolder}/out/**/*.js"]
    }
  ]
}
```

- `type`: Node.js 런타임 환경에 디버깅을 실행할 것이기 때문에 `"node"`로 설정
- `request`: `"launch"` 설정을 통해 새로운 노드 프로세스 시작을 요청
- `name`: 디버거 이름
- `program`: 디버거를 실행할 파일
- `preLaunchTask`: 디버거 실행 전 실행할 task 설정
- `outFiles`: 타입스크립트에서 생성된 자바스크립트 파일 경로

이대로 실행하면 실패하는데 그 이유는 `preLaunchTask`에 설정한 `task`가 VSCode tasks에 없기 때문이다.

[Integrate with External Tools via Tasks](https://code.visualstudio.com/docs/editor/tasks) 에 보면 VSCode 에서 `task` 는

> Tasks in VS Code can be configured to run scripts and start processes so that many of these existing tools can be used from within VS Code without having to enter a command line or write new code. Workspace or folder specific tasks are configured from the tasks.json file in the .VSCode folder for a workspace.

VSCode의 작업(Task)은 스크립트를 실행하고 프로세스를 시작할 수 있도록 구성될 수 있어서, 기존의 많은 도구들을 명령 줄에 입력하거나 새 코드를 작성하지 않고도 VS Code 내에서 사용할 수 있다고 한다. 워크스페이스 또는 폴더별 작업은 워크스페이스의 `.vscode` 폴더에 있는 `tasks.json` 파일에서 구성할 수 있다.

타입스크립트 파일에서 `⇧⌘B`를 누르면 아래 이미지처럼 두 개의 `task`를 볼 수 있는데 여기서 `"tsc: 빌드 - tsconfig.json"`가 바로 위에 예시로 나온 `"preLaunchTask": "tsc: build - tsconfig.json"`을 의미한다. 하지만 나는 VSCode를 한국어로 사용 중이기 때문에 만약 해당 task를 실행하고 싶다면 `build`를 `빌드`라고 적어놓으면 된다.

```json
"preLaunchTask": "tsc: 빌드 - tsconfig.json",
```

![Select build to execute](/public/images/blog/2024/2024-01/select-task.png)

task 파일도 `launch.json`과 마찬가지로 `task.json` 파일에서 설정을 수정할 수 있다.

![Setting tasks.json](/public/images/blog/2024/2024-01/set-tasks.png)

참고로 `group` 설정은 `"build"`, `"test"` 등으로 설정할 수 있는데 VSCode에서 `⇧⌘P`를 눌렀을 때 `Run [group name] Task`로 해당 그룹 별로 실행할 수 있는 설정이다.

이제 원하는 대로 설정 값을 입력 후 `launch.json`에 설정한 name 대로 디버그 셀렉터에서 `"디버그"`를 클릭하면 성공적으로 `app.ts`를 따로 명령어를 입력하지 않아도 자동으로 컴파일 후 디버깅이 시작되는 것을 확인할 수 있다.

![Setting launch.json](/public/images/blog/2024/2024-01/set-launch-tasks.png)

![Clicking to start debug execution](/public/images/blog/2024/2024-01/launch-task-debugging.png)

이제 코드를 수정해도 디버깅 시작 시점에 자바스크립트로 변환과 소스맵 생성이 자동으로 처리되기 때문에 귀찮게 명령어를 입력하지 않아도 된다.

하지만 디버깅을 종료해도 오른쪽 하단에 보면 task는 여전히 동작 중인 것을 확인할 수 있다.

```json
// tasks.json

"presentation": {
      "close": true
}
```

이럴 땐 `tasks.json` 파일에서 [VSCode 2021년 5월(버전 1.57)](https://code.visualstudio.com/updates/v1_57#_automatically-close-task-terminals) 에 추가된 `presentation`의 `close` 설정을 `true`로 하면 작업이 종료될 때 터미널이 닫힌다.

## 마치면서

1. VSCode에서 타입스크립트 코드를 디버깅하기 위해서는 자바스크립트로 변환된 파일을 디버깅해야 한다.
2. 이를 자동화하기 위해 소스맵을 생성하고, `launch.json`과 `tasks.json` 파일을 설정하여 디버깅 시작 시 자동으로 컴파일이 되도록 할 수 있다.
3. `tasks.json` 파일에서 `presentation` 속성의 `close`를 `true`로 설정하여 디버깅 종료 후 터미널이 자동으로 닫히도록 할 수 있다.

이제 VSCode에서 타입스크립트 디버깅을 더욱 편리하게 설정할 수 있다. 코드 수정 후에도 디버깅 버튼 한 번으로 자동으로 컴파일 및 디버깅이 진행되니 효율적인 디버깅 환경을 구축할 수 있다.

## 참고자료

- [VScode 공식문서](https://code.visualstudio.com/docs/typescript/typescript-debugging)
- [VSCode 2021년 5월(버전 1.57)](https://code.visualstudio.com/updates/v1_57#_automatically-close-task-terminals)
