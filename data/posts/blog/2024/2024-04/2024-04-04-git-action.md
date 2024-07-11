# SSH Key 및 Personal Access Token 설정

회사에서는 공용 키를 사용하는 것이 이상적이지만, 멤버 개인의 키를 사용하는 경우도 있을 수 있다. 이때 해당 멤버가 퇴사하면서 계정이 삭제되면 해당 멤버의 키는 모두 유효하지 않아 액션이 실패하게 된다. 따라서 아래 방법을 통해 키를 대체해야 한다.

## SSH (Secure Shell)

커밋을 푸시할 때마다 아이디와 비밀번호를 입력해야 한다면 매우 불편할 것이다. SSH 키를 사용하면 이러한 불편함을 해소할 수 있다. 다음은 SSH 키를 설정하는 과정이다.

```bash
vi ~/.ssh

id_rsa
id_rsa.pub
```

### 준비물

- id_rsa.pub
- id_rsa
- token

GitHub 프로필 메뉴에서 Settings > SSH and GPG keys로 이동한다.
![Clicking the settings menu](/public/images/blog/2024/2024-04/click-setting-menu.png)

New SSH key 버튼을 클릭한다.
![Clicking the new ssh key](/public/images/blog/2024/2024-04/click-new-ssh-key.png)

`id_rsa.pub` 파일의 내용을 그대로 복사하여 붙여넣는다.
![Add the new ssh key](/public/images/blog/2024/2024-04/add-new-ssh-key.png)

## 회사 권한 부여

SSH 키를 추가한 후 회사 권한을 부여해야 한다. 권한이 부여되지 않은 경우 흰색 텍스트로 Authorize 상태이다. 해당 버튼을 클릭하여 붉은 글씨로 Deauthorize 상태로 변경해야 한다. (버튼이 아닌 라벨처럼 마치 붉은 글씨가 권한이 취소된 상태처럼 보이는게 UI 가 매우 아쉽다)
![Authorizing](/public/images/blog/2024/2024-04/ssh-authorize.png)

등록이 끝나면 보통 바로 위 사진처럼 키가 초록색이 아닌 아래 사진처럼 흰색인데 아직 ssh 키를 사용(커밋 푸쉬 등)하지 않아서니깐 걱정하지 않아도 된다.
![Finish SSH keys](/public/images/blog/2024/2024-04/never-use-key.png)

Settings 메뉴에서 Developer settings로 이동한다.
![Moving to Developer settings](/public/images/blog/2024/2024-04/click-developer-settings.png)

Personal access tokens > Tokens (classic) > Generate new token 버튼을 클릭한다.
![Clicking the Generate new token](/public/images/blog/2024/2024-04/generate-new-token.png)

토큰을 생성한 후 회사 권한을 활성화한다.
![Editing personal token](/public/images/blog/2024/2024-04/edit-personal-token.png)
![Token authorize](/public/images/blog/2024/2024-04/token-authorize.png)

### 체크리스트

- ssh 키 생성
- ssh 키 회사 권한 활성화
- 토큰 생성
- 토큰 회사 권한 활성화

## GitHub Action 설정

레포지토리 설정으로 이동하여 Settings > Secrets and variables > Actions > New repository secret 버튼을 클릭한다.

![Clicking repository settings](/public/images/blog/2024/2024-04/click-repository-settings.png)
![Adding new repository secret](/public/images/blog/2024/2024-04/add-new-repository-secret.png)

key 이름은 상관없다. 다만 workflows 에서 `secrets.` 뒤에 설정할 변수 이름과 key 가 동일해야 한다.

`id_rsa` 텍스트를 그대로 복사하여 붙여넣는다. 이때 `----BEGIN` 과 `-----END` 까지 복사해서 붙여넣어야 한다.
![Copy and paste id_rsa](/public/images/blog/2024/2024-04/copy-paste-id_rsa.png)

`GH_PAT` 키로 생성한 개인 토큰도 동일하게 생성한다.

이렇게 생성이 완료된 것을 확인할 수 있다.
![action secret keys](/public/images/blog/2024/2024-04/action-secret-keys.png)

이후 workflows에 설정한 변수 이름을 적용하면 된다.

```yaml
- name: Checkout
  uses: actions/checkout@v2
  with:
    submodules: recursive
    token: ${{ secrets.GH_PAT }}

- name: Setup SSH
  uses: MrSquaare/ssh-setup-action@v3
  with:
    host: github.com
    private-key: ${{ secrets.POSI_GITHUB_ACTION_PRIVATE_KEY }}
```

## 마치면서

회사 공용 키를 설정하는 것이 가장 이상적이지만, 공용 키를 요청이 승인될 때까지 개인 키를 사용해야 하는 상황에서는 위 과정을 통해 SSH 키와 Personal Access Token을 설정하여 사용하면 된다.

## 참고자료

- [4.3 Git 서버 - SSH 공개키 만들기](https://git-scm.com/book/ko/v2/Git-%EC%84%9C%EB%B2%84-SSH-%EA%B3%B5%EA%B0%9C%ED%82%A4-%EB%A7%8C%EB%93%A4%EA%B8%B0)
- [원격제어 - SSH란무엇인가?](https://www.youtube.com/watch?v=jUyrwaCct44)
- [GitHub Actions에서 비밀 사용](https://docs.github.com/ko/actions/security-guides/using-secrets-in-github-actions)
