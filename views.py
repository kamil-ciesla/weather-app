from flask import render_template, redirect

def display_main_page():
    return redirect('/hourly')
    
def display_hourly_page():
    return render_template('hourly_chart.html')

def display_seven_days():
    return render_template('seven_days.html')

def display_air_pollution():
    return render_template('air_pollution.html')

def display_map():
    return render_template('map.html')