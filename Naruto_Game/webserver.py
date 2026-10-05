from flask import Flask, render_template, send_from_directory

app = Flask(__name__, static_url_path="", static_folder=".", template_folder=".")


@app.route("/")
def index():
    return send_from_directory(".", "index.html")


@app.route("/<path:filename>")
def serve_static(filename):
    return send_from_directory(".", filename)


import os

# ... your existing routes ...

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)



    