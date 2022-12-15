# base

## vscode settings

명령 팔레트를 열고 Open Workspace Settings (JSON) 입력합니다.
Workspace 루트에 .vscode 라는 폴더안에 settings.json 파일이 생성됩니다.

편집기에서 공백 문자를 렌더링합니다.
"editor.renderWhitespace": "all"

단어 관련 탐색 또는 작업을 수행할 때 단어 구분 기호로 사용할 문자입니다.
"editor.wordSeparators": "`~!@#$%^&\*()=+[{]}\\|;:'\",.<>/?"

---

## git 저장소 생성하기

Git 사용할 때 보통 다른 사람이 이미 생성해 놓은 Git 원격 저장소를 git clone 명령어를 통해 내려받는 경우가 많지만, 로컬 프로젝트를 Git으로 버전 관리를 하는 경우 `git init` 명령어를 사용해 git 저장소를 생성하게 됩니다.
저장소를 먼저 생성하고 원격 저정소를 만들수도 있습니다.

```
git remote add origin git@github.com:userid/repository.git
git branch -M main
git push -u origin main
```

---

## GitHub 여러 계정 SSH key로 관리하기

### SSH 키 만들기

이미 만들어 놓은 SSH 키가 있다면 그걸 사용하고, 없으면 계정마다 키를 만들어줘야 한다.

```
ssh-keygen -t rsa -C "account1@email1.com" -f "id_rsa_account1"
ssh-keygen -t rsa -C "account2@email2.com" -f "id_rsa_account2"
```

### GitHub 계정에 SSH 키 등록하기

터미널로 ssh키 클립보드로 복사하기

```shell
pbcopy < ~/.ssh/id_rsa.pub
```

1. Settings로 이동한다.
2. SSH and GPG keys 를 선택한다.
3. New SSH key를 선택하고 원하는 이름을 입력한 뒤 복사한 공개키를 붙여넣는다.
4. Add key를 눌러 등록을 완료한다.

### SSH config 수정하기

계정마다 다른 SSH 키를 사용해야 하기 때문에 SSH config 파일을 수정한다. 위치는 ~/.ssh/config 이며 없을 경우 새로 만들어준다. 그 다음 계정마다 다음의 내용을 추가한다.

```shell
# account1
Host github.com-account1
   HostName github.com
   User git
   IdentityFile ~/.ssh/id_rsa_account1

# account2
Host github.com-account2
   HostName github.com
   User git
   IdentityFile ~/.ssh/id_rsa_account2
```

### Git local config 수정하기

깃 리파지토리마다 계정을 다르게 사용하기 위해서 로컬 설정을 한다.

```shell
git config --local user.name "account1"
git config --local user.email "account1@email1.com"
```

### remote url 등록하기

```shell
git remote set-url origin git@github.com-account1:repo_user/repo_name.git
```

### remote url 수정하기

```shell
git remote set-url origin git@github.com-account1:repo_user/repo_name.git
```

---

## package.json 실행

yarn init

## scss 설정

scss 컴파일 관련 nodeModules을 devDependencies로 설치한다.

```shell
yarn add -D sass
```

package.json 에 스크립트 작성.

```json
"script": {
  "css-compile": "sass --style expanded --source-map --embed-sources --no-error-css scss/:dist/css/"
}
```

`css-compile` 명령어를 실행해 scss 파일이 컴파일 되는지 확인해보세요.

nodemon은 node monitor의 약자로, 노드가 실행하는 파일이 속한 디렉터리를 감시하고 있다가 파일이 수정되면 자동으로 노드 애플리케이션을 재시작하는 확장 모듈입니다. scss 파일을 감시해 파일 수정시 `css-compile` 스크립트를 실행하게 만듭다. 하지만 packages.json에 작성한 scripts들은 기본적인 명령어로는 한번에 여러개의 script를 실행할 수 없습니다. 하나의 명령어로 여러개를 실행하고 싶을 때 npm-run-all패키지를 사용하면 됩니다.

```shell
yarn add -D nodemon npm-run-all
```

package.json 에 스크립트 작성.

```json
"script": {
  "css-compile": "sass --style expanded --source-map --embed-sources --no-error-css scss/:dist/css/",
  "watch-css": "nodemon --watch scss/ --ext scss --exec \"npm-run-all css-compile\""
}
```

이제 `yarn watch-css`를 명령어를 실행하여 scss 파일을 수정해 보면 자동으로 scss 파일이 컴파일 되어 배포되는 것을 확인할 수 있습니다.
명령어가 익숙하지 않아 `yarn start`로 변경해보겠습니다.

```shell
"scripts": {
  "start": "npm-run-all --parallel watch",
  "css-compile": "sass --style expanded --source-map --embed-sources --no-error-css scss/:dist/css/",
  "watch": "npm-run-all --parallel watch-'*'",
  "watch-css": "nodemon --watch scss/ --ext scss --exec \"npm-run-all css-compile\""
}
```

---

### 기타

- 22/12/14
  ZSH 에서 별표 사용시 NO MATCHES FOUND - 별표가 포함된 문자를 ‘(작은 따옴표)로 감싸주면 된다.

```

```
