$csharpCode = @"
using System;
using System.IO;
using System.Net;
using System.Threading;

public class FastServer {
    private HttpListener _listener;
    private string _root;
    private int _port;

    public FastServer(int port, string root) {
        _port = port;
        _root = root;
        _listener = new HttpListener();
        _listener.Prefixes.Add("http://localhost:" + port + "/");
        _listener.Prefixes.Add("http://127.0.0.1:" + port + "/");
    }

    public void Start() {
        _listener.Start();
        Console.WriteLine("Portfolio server running at http://localhost:" + _port + "/");
        _listener.BeginGetContext(OnContext, null);
    }

    private void OnContext(IAsyncResult ar) {
        try {
            if (!_listener.IsListening) return;
            var ctx = _listener.EndGetContext(ar);
            _listener.BeginGetContext(OnContext, null);
            ThreadPool.QueueUserWorkItem(s => ProcessRequest(ctx));
        } catch {}
    }

    private void ProcessRequest(HttpListenerContext ctx) {
        try {
            var req = ctx.Request;
            var res = ctx.Response;
            string urlPath = req.Url.AbsolutePath;
            if (urlPath == "/" || string.IsNullOrEmpty(urlPath)) urlPath = "/index.html";
            string relative = Uri.UnescapeDataString(urlPath.TrimStart('/').Replace('/', '\\'));
            string filePath = Path.Combine(_root, relative);

            if (File.Exists(filePath)) {
                string ext = Path.GetExtension(filePath).ToLower();
                string mime = "application/octet-stream";
                if (ext == ".html") mime = "text/html; charset=utf-8";
                else if (ext == ".css") mime = "text/css; charset=utf-8";
                else if (ext == ".js") mime = "application/javascript; charset=utf-8";
                else if (ext == ".jpg" || ext == ".jpeg") mime = "image/jpeg";
                else if (ext == ".png") mime = "image/png";
                else if (ext == ".svg") mime = "image/svg+xml";

                res.ContentType = mime;
                res.AddHeader("Access-Control-Allow-Origin", "*");
                res.AddHeader("Cache-Control", "no-cache");

                byte[] data = File.ReadAllBytes(filePath);
                res.ContentLength64 = data.Length;
                if (req.HttpMethod != "HEAD") {
                    res.OutputStream.Write(data, 0, data.Length);
                }
            } else {
                res.StatusCode = 404;
                byte[] notFound = System.Text.Encoding.UTF8.GetBytes("Not Found");
                res.ContentLength64 = notFound.Length;
                res.OutputStream.Write(notFound, 0, notFound.Length);
            }
            res.Close();
        } catch {}
    }
}
"@

Add-Type -TypeDefinition $csharpCode -Language CSharp
$server = New-Object FastServer(3000, "F:\portfolio")
$server.Start()

while ($true) {
    Start-Sleep -Seconds 3600
}
