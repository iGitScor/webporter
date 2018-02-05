Vue.component("exports", {
  template: `
    <div>
      <div class="mdl-grid" v-for="exportation in dataExports">
        <div class="demo-cards mdl-cell" v-bind:class="{ 'mdl-cell--12-col': (!selectedExport || selectedExport.id !== exportation.id), 'mdl-snackbar--active mdl-cell--4-col': (selectedExport && selectedExport.id == exportation.id) }">
          <div class="demo-updates mdl-card mdl-shadow--2dp mdl-cell mdl-cell--4-col mdl-cell--4-col-tablet mdl-cell--12-col-desktop">
            <div class="mdl-card__title mdl-card--expand mdl-color--primary mdl-color-text--primary-contrast">
              <h2 class="mdl-card__title-text mdl-card__title-etiquette">
                {{exportation.title}}
              </h2>
            </div>
            <div class="mdl-card__supporting-text mdl-color-text--grey-600" v-bind:class="{ 'hidden': (selectedExport && selectedExport.id == exportation.id) }">
              {{exportation.description}}
            </div>
            <div class="mdl-card__actions mdl-card--border">
              <button type="button" data-upgraded=",MaterialButton,MaterialRipple" class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-color--pink-600 mdl-color-text--accent-contrast" v-on:click="getExport(exportation.id)">
                {{selectedExport && selectedExport.id == exportation.id ? 'Cancel' : 'Export'}}<span class="mdl-button__ripple-container"><span class="mdl-ripple"></span></span>
              </button>
            </div>
          </div>
        </div>
        <div class="mdl-cell mdl-cell--8-col" v-if="selectedExport && selectedExport.id == exportation.id">
          <form v-on:submit.prevent="getData">
            <label v-for="params in selectedExport.Parameters" style="display: block; margin-bottom: 15px;">
              {{params.label}}<br />
              <input :name="params.name" :type="params.type" v-model="formValues[params.name]" />
            </label>
            <input name="export_id" type="hidden" :value="selectedExport.id" />
            <button v-if="!result" type="submit" class="mdl-button mdl-button--raised mdl-color--green-A100">Valider</button>
            <p v-if="result">
              <a :href="result" download class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored"><i class="material-icons">file_download</i></a>
              Download export file
            </p>
          </form>
        </div>
      </div>
    </div>`,
  data: () => {
    return {
      formValues: {},
      selectedExport: null,
      dataExports: [],
      result: null
    };
  },
  mounted: function() {
    this.$nextTick(function() {
      fetch("/exports.json")
        .then(response => response.json())
        .then(json => {
          this.dataExports = json.data.allRequests;
        })
        .catch(ex => {});
    });
  },
  methods: {
    // Get export fields
    getExport: function(id) {
      if (this.selectedExport === null || this.selectedExport.id !== id) {
        this.$nextTick(function() {
          const params = {id};
          const query = Object.keys(params)
             .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(params[key]))
             .join('&');
          fetch(`/export?${query}`)
            .then(response => response.json())
            .then(json => {
              this.selectedExport = { id, ...json.data.Request };
            })
            .catch(ex => {});
        });
      } else {
        [this.result, this.selectedExport] = Array(2).fill(null);
      }
    },
    // Get export as .csv link
    getData: function(event) {
      const formValues = {};
      const elements = event.target.elements;
      for (let i = 0; i < elements.length; i += 1) {
        const element = elements[i];
        if (element.name !== "") {
          formValues[element.name] = element.value;
        }
      }

      fetch("/export", {
        method: "POST",
        body: JSON.stringify(formValues),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
        .then(response => response.text())
        .then(result => {
          this.result = result;
        });
    }
  }
});

var app = new Vue({
  el: "#app"
});
