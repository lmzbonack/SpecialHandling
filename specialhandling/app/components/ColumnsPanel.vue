<template>
    <div class="card">
        <div class="card-block">
            <div class="panel-flex">
                <div v-for="col in columndefs" :key="col.headerName">
                    <check-box :id="col.field" :label="col.headerName"
                               :checked="displayedcols[col.field]" @change="updateVisibility"></check-box>
                </div>
            </div>
        </div>
    </div>
</template>

<script>

export default {
    props: {
        /**
         * Reference to ag-grid column definitions
         * @prop {Array}
         */
        columndefs: {
            type: Array,
            required: true
        },
        /**
         * Reference to ag-grid displayed columns
         * @prop {Object}
         */
        displayedcols: {
            type: Object,
            required: true
        },
        /**
         * Reference to the ag-grid api
         * @prop {Object}
         */
        grid: {
            type: Object,
            required: true
        }
    },
    computed: {
        /**
         * Returns the columns api from the grid
         * @returns {Object}
         */
        colApi: function () {
            return this.grid.columnApi;
        }
    },
    methods: {
        /**
         * Toggle visibility of a column
         * @param {Boolean} visible
         * @param {String} field the column name
         */
        updateVisibility (visible, field) {
            this.colApi.setColumnVisible(field, visible);
        }
    }
};
</script>

<style lang="scss" scoped>
.card {
    border-radius: 0;
}

// Scroll the panel except when in narrow width
.card-block {
    overflow-y: auto;
    overflow-x: hidden;
    display: flex;
    flex: 1 1 100%;
}

.panel-flex {
    display: flex;
    margin: 1em;
    flex: auto;
    flex-direction: column;
    align-items: flex-start;

    .item {
        margin-bottom: 0;
    }

    @media screen and (max-width: 768px) {
        flex-direction: row;
        justify-content: flex-start;
        flex-wrap: wrap;

        .item {
            display: block;
            min-width: 20%;
            margin-right: 1em;
        }
    }
}
</style>
