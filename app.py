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
    page_name = 'hourly'
    return render_template('hourly_chart.html',page_name=page_name)

@app.route('/seven-days')
def display_seven_days():
    page_name='seven-days'
    return render_template('seven_days.html',page_name=page_name)

@app.route('/air-pollution')
def display_air_pollution():
    page_name='air-pollution'
    return render_template('air_pollution.html',page_name=page_name)

@app.route('/map')
def display_map():
    page_name='map'
    return render_template('map.html',page_name=page_name)

@app.route('/search', methods=['GET', 'POST'])
def search():
    if request.method == "POST":
        location_name = request.form['location_name']
    page_name = 'hourly'
    return render_template('/hourly_chart.html', page_name=page_name, location_name=location_name)

if __name__ == "__main__":
    app.run()


