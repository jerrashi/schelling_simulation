from flask import Flask, render_template, request
import utility
import schelling

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/simulation', methods=['POST'])
def simulation():
    # Get the form data
    filename = request.form['filename']
    R = int(request.form['R'])
    simil_threshold = float(request.form['simil_threshold'])
    occup_threshold = float(request.form['occup_threshold'])
    max_steps = int(request.form['max_steps'])
    
    # Perform the simulation
    # Add your code here to perform the simulation using the parameters
    
    # Return the simulation results to a template
    return render_template('simulation.html', results=results)