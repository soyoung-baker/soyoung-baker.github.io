# pnpm action node version 에러

PR을 올린 후 GitHub Actions가 실패하는 문제가 발생했다. 로그를 확인해보니 install pnpm 단계에서 에러가 발생한 것이었다.
내용은 아래와 같은데

![pnpm action error](/public/images/blog/2024/2024-07/pnpm-action-error.png)

어제까지 잘 작동하던 액션이 갑자기 에러를 발생시키니, 특별한 설정 변경이 없었음에도 원인을 찾기 위해 구글링을 시작했다.

https://github.com/pnpm/action-setup/issues/135

똑같은 증상으로 issue 를 올린 글을 확인했다.

## 문제 원인 및 해결책

문제의 원인은 pnpm/action-setup 이슈에서 동일한 증상을 겪고 있는 사람들의 글을 통해 확인할 수 있었다. 해결책은 checkout 액션을 최신 버전인 v4로 업그레이드하는 것이었다. 실제로 버전을 올린 후 문제가 해결되었다. 왜 이런 문제가 발생했는지 알아보았다.

GitHub Actions와 Node.js 버전 전환

작년부터 올해 GitHub Actions는 Node.js 20으로 전환하는 과정을 진행 중이었다.

[GitHub Actions: Transitioning from Node 16 to Node 20](https://github.blog/changelog/2023-09-22-github-actions-transitioning-from-node-16-to-node-20/)

- Node.js 16 지원이 종료된다.
- GitHub Actions는 Node.js 20으로 전환하는 프로세스를 시작했고, 2024년 봄까지 모든 액션을 Node.js 20에서 실행되도록 전환할 예정이다.
- 2023년 10월 23일부터는 Node.js 16에서 실행되는 액션이 포함된 워크플로에 경고가 표시되어 사용자에게 다가오는 전환을 알릴 것이다.

이러한 GitHub Actions 의 소식으로 pnpm/action-setup 에서는 아래와 같은 대화가 있었다.
[node20 support](https://github.com/pnpm/action-setup/issues/99#issuecomment-1737700746)

- pnpm/action-setup@v2 를 사용하는 사용자는 2023년 10월 23일부터 GitHub Actions로부터 지원 중단 경고를 받기 시작한다.
- Node.js 20 을 지원하는 pnpm/action-setup@v3 을 릴리스하면 명확한 전환을 제공할 수 있다.
- GitHub 이 Node.js 20 을 강제로 사용하기 때문에
- actions/checkout은 Node.js 16에서 Node.js 20으로 마이그레이션하면서 actions/checkout@v3 에서 actions/checkout@v4로 새로운 주요 릴리스를 만들었다.

그리고 2024년 5월 17일에 [Updated dates for Actions runner using Node20 instead of Node16 by default](https://github.blog/changelog/2024-05-17-updated-dates-for-actions-runner-using-node20-instead-of-node16-by-default/) 업데이트 글이 올라왔다.

- 2024년 6월 30일에 Node16의 기본 설정이 Node20으로 변경된다.
- Node16을 계속 사용하려면, ACTIONS_ALLOW_USE_UNSECURE_NODE_VERSION=true 환경 변수를 설정하면 된다.
- 2024년 10월 초까지 Node16 사용량을 모니터링하면서 마이그레이션을 완료할 수 있는 시간 줄게.

따라서 Node.js 16으로 실행되던 pnpm/action-setup@v2를 사용해서 위와 같은 에러가 발생한 것이다. 그래서 Node.js 20을 제공하는 pnpm/action-setup@v3 버전이 릴리스된 것을 확인할 수 있다. [v3 릴리즈 노트](https://github.com/pnpm/action-setup/releases/tag/v3.0.0)

이러한 이유로 처음에 v4로 버전업을 했을 때 에러가 해결된 것이다.

## 마치면서

결론적으로 이 에러를 해결하기 위해 Node.js 20을 지원하는 pnpm/action-setup@v3, v4를 선택하면 된다.
또한 해당 에러를 수정하면서 actions/checkout @v2에서 @4로 전환했다.

참고로 pnpm/action-setup 액션은 Node.js를 설정하지 않기 때문에 Node.js 설정은 actions/setup-node를 사용하여 별도로 해야 한다. Node.js를 따로 설치해서 사용하지 않고 빌트인된 것을 쓰는 다른 팀에서는 runner-images 등 Node 16 버전 관련 에서 에러가 발생하기 시작했다.

앞으로 업데이트되는 문서를 더 신경써서 봐야겠다.

## 참고자료

- https://github.com/pnpm/action-setup
- https://github.com/pnpm/action-setup/issues/99#issuecomment-1737700746
- https://github.blog/changelog/2023-09-22-github-actions-transitioning-from-node-16-to-node-20/
