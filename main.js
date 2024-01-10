var http = require('http'); // 'http' 모듈 로드
var fs = require('fs'); // 'fs' 모듈 로드
var url = require('url'); // 'url' 모듈 로드
var qs = require('querystring'); // 'querystring' 모듈 로드
var template = require('./lib/template.js'); // 사용자 정의 모듈 로드
var path = require('path'); // 'path' 모듈 로드
// HTTP 서버 생성
var app = http.createServer(function(request, response) {
    var _url = request.url; // 요청된 URL
    var queryData = url.parse(_url, true).query; // URL 쿼리 파라미터 추출
    var pathname = url.parse(_url, true).pathname; // URL 경로 추출
    // 홈페이지 루트 처리
    if (pathname === '/') {
        if (queryData.id === undefined) {
            // 파일 목록 읽기
            fs.readdir('./data', function(error, filelist) {
                var title = 'Welcome';
                var description = 'Hello, Node.js';
                var list = template.List(filelist); // 파일 목록 HTML 생성
                var html = template.HTML(title, list,
                    `<h2>${title}</h2>${description}`,
                    `<a href="/create">create</a>`
                );
                response.writeHead(200); // 성공 응답 코드
                response.end(html); // 응답 전송
            });
        } else {
            // 특정 파일 읽기
            fs.readdir('./data', function(error, filelist) {
                var filteredId = path.parse(queryData.id).base;
                fs.readFile(`data/${filteredId}`, 'utf8', function(err, description) {
                    var title = queryData.id;
                    var list = template.List(filelist);
                    var html = template.HTML(title, list,
                        `<h2>${title}</h2>${description}`,
                        `<a href="/create">create</a>
                        <a href="/update?id=${title}">update</a>
                        <form action="delete_process" method="post">
                            <input type="hidden" name="id" value="${title}">
                            <input type="submit" value="delete">
                        </form>`
                    );
                    response.writeHead(200);
                    response.end(html);
                });
            });
        }
    } else if (pathname === '/create') {
        // 새 파일 생성 페이지
        fs.readdir('./data', function(error, filelist) {
            var title = 'WEB - create';
            var list = template.List(filelist);
            var html = template.HTML(title, list, `
                <form action="/create_process" method="post">
                    <p><input type="text" name="title" placeholder="title"></p>
                    <p>
                        <textarea name="description" placeholder="description"></textarea>
                    </p>
                    <p>
                        <input type="submit">
                    </p>
                </form>
            `, '');
            response.writeHead(200);
            response.end(html);
        });
    } else if (pathname === '/create_process') {
        // 파일 생성 처리
        var body = '';
        request.on('data', function(data) {
            body = body + data;
        });
        request.on('end', function() {
            var post = qs.parse(body);
            var title = post.title;
            var description = post.description;
            fs.writeFile(`data/${title}`, description, 'utf8', function(err) {
                response.writeHead(302, { Location: `/?id=${title}` });
                response.end();
            });
        });
    } else if (pathname === '/update') {
        // 파일 업데이트 페이지
        fs.readdir('./data', function(error, filelist) {
            var filteredId = path.parse(queryData.id).base;
            fs.readFile(`data/${filteredId}`, 'utf8', function(err, description) {
                var title = queryData.id;
                var list = template.List(filelist);
                var html = template.HTML(title, list,
                    `
                    <form action="/update_process" method="post">
                        <input type="hidden" name="id" value="${title}">
                        <p><input type="text" name="title" placeholder="title" value="${title}"></p>
                        <p>
                            <textarea name="description" placeholder="description">${description}</textarea>
                        </p>
                        <p>
                            <input type="submit">
                        </p>
                    </form>
                    `,
                    `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
                );
                response.writeHead(200);
                response.end(html);
            });
        });
    } else if (pathname === '/update_process') {
        // 파일 업데이트 처리
        var body = '';
        request.on('data', function(data) {
            body = body + data;
        });
        request.on('end', function() {
            var post = qs.parse(body);
            var id = post.id;
            var title = post.title;
            var description = post.description;
            fs.rename(`data/${id}`, `data/${title}`, function(error) {
                fs.writeFile(`data/${title}`, description, 'utf8', function(err) {
                    response.writeHead(302, { Location: `/?id=${title}` });
                    response.end();
                });
            });
        });
    } else if (pathname === '/delete_process') {
        // 파일 삭제 처리
        var body = '';
        request.on('data', function(data) {
            body = body + data;
        });
        request.on('end', function() {
            var post = qs.parse(body);
            var id = post.id;
            var filteredId = path.parse(id).base;
            fs.unlink(`data/${filteredId}`, function(error) {
                response.writeHead(302, { Location: `/` });
                response.end();
            });
        });
    } else {
        // 404 - 찾을 수 없음
        response.writeHead(404);
        response.end('Not found');
    }
});
// 서버를 3000 포트에서 실행
app.listen(3000);