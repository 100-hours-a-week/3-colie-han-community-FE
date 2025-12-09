# Satellite

> **Satellite**는 지구 궤도를 돌며 정보와 신호를 전달하는 인공위성처럼,  
> 각자의 우주를 품은 사람들이 서로의 생각과 발견을 공유하고 연결되는 플랫폼입니다.  

<br>

**🌍 Service URL**  
https://colie.site  

<br>

**🔗 Backend Repository**  
https://github.com/100-hours-a-week/3-colie-han-community-BE  


<br>

## 🔭 목차

- [🌌 소개](#-소개)
- [🎥 시연 영상](#-시연-영상)
- [🪐 UI](#-ui)
- [🛰 기술 스택](#-기술-스택)
- [🌠 구현 기능](#-구현-기능)

<br>

## 🌌 소개

- Satellite는 우주를 사랑하는 사람들을 위한 커뮤니티입니다.
- 사용자는 자유롭게 게시글을 작성하고 사람들과 소통할 수 있습니다.
<!--- 게시글 작성 시점을 기준으로 은하수 좌표를 계산해, 모든 사용자가 함께 우주 지도를 만들 수 있습니다.-->

<br>

## 🎥 시연 영상



https://github.com/user-attachments/assets/13357295-c832-4177-98b1-f0c48717d114


<br>

## 🪐 UI
(이미지)

<br>

## 🛰 기술 스택

**Frontend**
- Vanilla JavaScript
- HTML, CSS
- Express

**Backend**
- Java, Spring Boot, Spring Security, JPA(Hibernate)
- DB: MySQL / H2
- Build: Gradle

**Infra & DevOps**
- AWS EC2, RDS, S3
- Nginx, Docker, Docker Compose
- GitHub Actions, Self-hosted Runner (CI/CD)
- Private Docker Registry (Basic Auth)

<br>

## 🌠 구현 기능

- 인증 / 사용자 영역
  - 로그인 / 로그아웃 / 회원가입 화면
  - 폼 유효성 검사 및 에러 메시지 표시
  - 로그인 성공 시 Access Token 저장 및 이후 요청에 Authorization 헤더 자동 추가
  - 로그인 상태에 따라 헤더/메뉴/버튼 노출 제어
  

- 게시글 / 댓글 UI
  - 게시글 목록 페이지
  - 최신 글 목록 조회
  - 제목, 작성자, 조회수, 좋아요 수 표시
  - 페이지네이션
  

- 게시글 상세 페이지
  - 본문 내용, 작성 시간, 조회수, 좋아요 상태 표시
  - 댓글 목록 및 댓글 작성/삭제 UI
  - 좋아요 토글 시 버튼/아이콘 상태 변경 및 실시간 카운트 반영
  

- 게시글 작성/수정 페이지
  - 제목/내용/이미지 업로드 폼
  - 글 작성 시 백엔드 API 호출 및 완료 후 목록/상세 페이지로 이동
  

- 프로필 페이지
    - 닉네임, 소개글, 프로필 이미지 조회/수정
  

<!--- 우주 테마 UI
  - 행성 테마 기반 UI 스타일 적용 (배경/컬러 등)
  - 선택된 테마에 맞춰 페이지 전체 분위기 변경
  - 게시글 생성 시각 기반 은하수 좌표 자동 계산값 수신
  - 좌표를 기반으로 게시글 위치를 시각화-->
