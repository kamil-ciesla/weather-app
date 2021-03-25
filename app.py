from flask import Flask
import views

app = Flask(__name__)
app.config.update(
    TEMPLATES_AUTO_RELOAD=True,
    debug=True
)

app.add_url_rule('/', view_func=views.display_main_page)
app.add_url_rule('/hourly', view_func=views.display_hourly_page)
app.add_url_rule('/seven-days', view_func=views.display_seven_days)
app.add_url_rule('/air-pollution', view_func=views.display_air_pollution)
app.add_url_rule('/map', view_func=views.display_map)

if __name__ == "__main__":
    app.run()


