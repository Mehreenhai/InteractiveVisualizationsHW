from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func
import pandas as pd
from flask import Flask, jsonify, render_template


#################################################
# Database Setup
#################################################
engine = create_engine("sqlite:///belly_button_biodiversity.sqlite")

# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(engine, reflect=True)

# Save references to the invoices and invoice_items tables
Otu = Base.classes.otu
Samples = Base.classes.samples
Samples_metadata = Base.classes.samples_metadata

# Create our session (link) from Python to the DB
session = Session(engine)

#################################################
# Flask Setup
#################################################
app = Flask(__name__)


#################################################
# Flask Routes
#################################################

@app.route("/")
def home():
    return render_template('index.html')



@app.route("/names")
def sample_ids():
    """Return a list of all sample IDs"""
    results = (session
               .query(Samples_metadata.SAMPLEID)
               .all()
              )
    results = [row[0] for row in results]
    sample_ids = []
    for result in results:
        id = "BB_" + str(result)
        sample_ids.append(id)
    return jsonify(sample_ids)


@app.route("/otu")
def OTUs():
    """Return list of OTU descriptions"""
    results = (session
                .query(Otu.lowest_taxonomic_unit_found)
              )
    otu_list = [row[0] for row in results]
    
    return jsonify(otu_list)

@app.route("/metadata/<sample>")
def metadata(sample='BB_940'):

    sample = int(sample[3:])
    """Return meta data for a given sample"""
    results = (session
               .query(Samples_metadata.AGE, 
                      Samples_metadata.BBTYPE,
                      Samples_metadata.ETHNICITY,
                      Samples_metadata.GENDER,
                      Samples_metadata.LOCATION,
                      Samples_metadata.SAMPLEID)
               .filter(Samples_metadata.SAMPLEID == sample)
               .group_by(Samples_metadata.SAMPLEID)
               .all())

    age = [row[0] for row in results][0]
    bbtype = [row[1] for row in results][0]
    ethnicity = [row[2] for row in results][0]
    gender = [row[3] for row in results][0]
    location = [row[4] for row in results][0]
    sampleid = [row[5] for row in results][0]


    data = {
        'AGE': age,
        'BBTYPE': bbtype,
        'ETHNICITY': ethnicity,
        'GENDER': gender,
        'LOCATION': location,
        'SAMPLEID': sampleid
    }
    return jsonify(data)

@app.route('/wfreq/<sample>')
def wfreq(sample ="BB_940"):
    sample = int(sample[3:])

    results = (session
               .query(Samples_metadata.WFREQ)
               .filter(Samples_metadata.SAMPLEID == sample)
               .group_by(Samples_metadata.SAMPLEID)
               .all())

    wfreq = [row[0] for row in results][0]
    data = {
        'Washing Frequency': wfreq
           } 
    return jsonify(data)
    
@app.route('/samples/<sample>')
def sample_values(sample ="BB_940"):

    sample = sample.upper()
    results = (session
               .query(Samples)
               .filter(getattr(Samples, sample) > 0)
               .order_by(getattr(Samples, sample).desc())
               .all())
    
    otu_ids = [row.otu_id for row in results]
    sample_values = [getattr(row, sample) for row in results]
    return jsonify([{'otu_ids': otu_ids, 'sample_values': sample_values}])

if __name__ == '__main__':
    app.run(debug=True)

