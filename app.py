from flask import Flask,render_template, redirect, request
import views

app = Flask(__name__)
app.config.update(
    TEMPLATES_AUTO_RELOAD=True,
    debug=True
)
@app.route('/')
def display_main_page():
    return redirect('/hourly')
@app.route('/hourly')
def display_hourly_page():
    return render_template('hourly_chart.html')
@app.route('/seven-days')
def display_seven_days():
    return render_template('seven_days.html')
@app.route('/air-pollution')
def display_air_pollution():
    return render_template('air_pollution.html')

@app.route('/map')
def display_map():
    return render_template('map.html')
@app.route('/search', methods=['GET', 'POST'])
def search():
    if request.method == "POST":
        location_name = request.form['location_name']
        print(location_name)
    return render_template('/hourly_chart.html', location_name=location_name)

if __name__ == "__main__":
    app.run()


