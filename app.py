from flask import Flask, render_template

app = Flask(__name__)
app.config.update(
    TEMPLATES_AUTO_RELOAD=True,
    debug=True
)

@app.route('/')
def index():
    return render_template('base.html')

@app.route('/hourly')
def display_hourly_page():
    return render_template('hourly_chart.html')

if __name__ == "__main__":
    app.run()

