<template>
    <div id="csvModal" class="export-csv-modal">
        <modal title="Export to CSV" v-model="show"
               size="custom" :max-width="800"
               role="dialog">
            <template slot="header">
                <h5 id="modal_title" class="modal-title">Export to CSV</h5>
                <button type="button" class="close" @click="closeCsvModal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </template>
            <div slot="content" class="view-details__modal">
                <div class="main-modal-content"> 
                    <text-box id="fileNameTextBox" type="text" label="File name:"
                              v-model="csv.fileName"
                              description="Example: 'export'. The csv extension does not need to be included in the file name.">
                    </text-box>
                </div>
            </div>
            <div slot="footer">
                <command label="Close" type="danger" icon="remove" @action="closeCsvModal"/>
                <command label="Save" type="success" icon="floppy-o" 
                         :disabled="disableSave" @action="exportCSV"/>
            </div>
        </modal>
    </div>
</template>

<script>
export default {
    name: 'ExportCsv',
    props: {
        /**
         * Visibility of the mmodal
         * @prop {Boolean}
         */
        show: {
            type: Boolean,
            default: false
        },
        /**
         * Reference to the ag-grid api
         * @prop {Object}
         */
        grid: {
            type: undefined,
            required: true
        }
    },
    data () {
        return {
            csv: {
                skipHeader: false,
                skipFooters: false,
                skipGroups: false,
                allColumns: false,
                fileName: '',
                columnSeparator: 0,
                processCellCallback: function (params) {
                    // Convert data to something more human readable
                    if (params.value === false) {
                        return 'No';
                    } else if (params.value === true) {
                        return 'Yes';
                    } else if(params.value && typeof params.value === 'string' && params.value.includes(':')) {
                        var formDate = new Date(params.value);
                        return formDate.toLocaleString("en-US");
                    } else if (params.value && params.value.toUpperCase){
                        if(params.value.includes('@')){
                            return params.value;
                        }
                        var splitStr = params.value.toLowerCase().split(' ');
                        for (var i = 0; i < splitStr.length; i++) {
                            splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
                        }
                        return splitStr.join(' '); 
                    } else {
                        return params.value;
                    }
                },
            }
        };
    },
    computed: {
        /**
         * Return the presence of a filename
         * @returns {Boolean}
         */
        disableSave () { return this.csv.fileName.trim() === ""; }
    },
    methods: {
        /**
         * Export the csv
         */
        exportCSV () {
            if (this.csv.fileName.trim() !== "") {
                this.csv.fileName = this.csv.fileName.trim();
                this.closeCsvModal();
                this.grid.exportDataAsCsv(this.csv);
            }
            this.csv.fileName = "";
        },
        /**
         * Close the modal
         */
        closeCsvModal () {
            this.$emit('closeCsv');
        }
    }
};
</script>
