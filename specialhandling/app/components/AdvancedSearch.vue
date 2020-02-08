<template>
    <div class="advanced-search__wrapper">
        <div class="header">
            <div class="header-section header-section__left">
                <command-dropdown v-if="showSelectionOptions"
                                  id="selectStatus"
                                  ref="dropdown" type="primary" outline split
                                  icon="check-square-o" :label="selectionMode | capitalize"
                                  @action="toggleMultiSelect" :active="multiselect">
                    <dropdown-item id="selectAll" button @action="selectAll">
                        <icon icon="th-large" fixed-width/>
                        <span>Select All</span>
                    </dropdown-item>
                    <dropdown-item id="selectNone" button @action="selectNone">
                        <icon icon="square-o" fixed-width/>
                        <span>Select None</span>
                    </dropdown-item>
                </command-dropdown>
            </div>
            <div class="header-section header-section__center">
                <command class="expand-toggle" type="primary"
                         label="Advanced Search" icon="search"
                         @action="toggleFiltersCollapse" :active="filters"/>
            </div>
            <div class="header-section header-section__right">
                <slot name="toolbar"></slot>
            </div>
        </div>
        <transition enter-active-class="collapsing" leave-active-class="collapsing"
                    @enter="onEnter" @afterEnter="onAfterEnter"
                    @leave="onLeave" @afterLeave="onAfterLeave">
            <div class="filter-collapse card" v-if="filters">
                <slot></slot>
            </div>
        </transition>
    </div>
</template>

<script>
export default {
    name: 'AdvancedSearch',
    props: {
        /**
         * Whether to show the selection dropdown toggle or not
         * @prop {Boolean}
         */
        showSelectionOptions: {
            type: Boolean,
            default: true
        }
    },
    data () {
        return {
            multiselect: false,
            filters: false
        };
    },
    computed: {
        /**
         * Return a stringified representation of selection state
         * @returns {String}
         */
        selectionMode () {
            if (this.multiselect === true) {
                return 'multiple';
            } else {
                return 'single';
            }
        }
    },
    methods: {
        /**
         * Toggle the filters
         */
        toggleFiltersCollapse () {
            this.filters = !this.filters;
        },
        /**
         * Toggle selection state
         */
        toggleMultiSelect () {
            this.multiselect = !this.multiselect;
            this.$emit('toggleMultiSelect', this.selectionMode);
        },
        /**
         * Select all grid rows
         */
        selectAll () {
            this.$emit('selectAll');
            this.$refs.dropdown.toggle();
        },
        /**
         * Unselect all grid rows
         */
        selectNone () {
            this.$emit('selectNone');
            this.$refs.dropdown.toggle();
        },
        
        // Transitions
        reflow (el) {
            // requsting an elements offsetHight will trigger a reflow of the element content
            let isElement = el && el.nodeType === Node.ELEMENT_NODE;
            return isElement && el.offsetHeight;
        },
        onEnter (el) {
            el.style.height = 0;
            this.reflow(el);
            el.style.height = el.scrollHeight + 'px';
            this.$emit('show');
        },
        onAfterEnter (el) {
            el.style.height = null;
            this.$emit('shown');
        },
        onLeave (el) {
            el.style.height = 'auto';
            el.style.display = 'block';
            el.style.height = el.getBoundingClientRect().height + 'px';
            this.reflow(el);
            el.style.height = 0;
            this.$emit('hide');
        },
        onAfterLeave (el) {
            el.style.height = null;
            this.$emit('hidden');
        }
    }
};
</script>

<style lang="scss" scoped>
.advanced-search__wrapper {
    padding: 0.25em;
    background-color: #f7f7f9;
    border: 1px solid rgba(0, 0, 0, 0.125);
    border-bottom: 0;
    border-radius: calc(0.25rem - 1px) calc(0.25rem - 1px) 0 0;

    .header {
        height: 38px; // Explicitely setting for when selection options are hidden
        display: flex;
        justify-content: space-between;

        .header-section {
            display: flex;
            flex: auto;

            &.header-section__left {
                width: 25%;
                justify-content: flex-start;
            }

            &.header-section__center {
                width: 50%;
                justify-content: center;   
            }

            &.header-section__right {
                width: 25%;
                justify-content: flex-end;
            }
        }

        .expand-toggle {
            width: 60%;
            justify-content: center;
            min-width: 180px;
            max-width: 500px;
        }
    }

    .filter-collapse {
        margin-top: 0.25em;
        height: auto;
        width: 100%;
    }
}

</style>
