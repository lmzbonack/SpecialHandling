<template>
    <div class="card">
        <div class="card-header d-flex justify-content-start align-items-center">
            <h5>{{ title }}</h5>
            <div v-if="collapsedState === true" class="ml-2">
                <slot name="summary"></slot>
            </div>
            <div class="ml-auto">
                <command :icon="iconState" @action="toggleCollapse" size="small" />
            </div>
        </div>
        <!--<transition
        name="rollup-transition"
        enter-active-class="animated bounceInDown"
        leave-active-class="animated bounceOutUp">
        <div v-show="collapsedState === false" class="card-block">
            <slot name="content"></slot>
        </div>
    </transition>-->
        <div v-show="collapsedState === false" class="card-block">
            <slot name="content"></slot>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        title: {
            type: String,
            required: true
        },
        collapsed: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    data () {
        return {
            collapsedState: false
        };
    },
    computed: {
        iconState: function () {
            if (this.collapsedState === true) {
                return "chevron-up";
            } else {
                return "chevron-down";
            }
        }
    },
    watch: {
        collapsed (collapse) {
            if (collapse !== undefined) {
                this.collapsedState = collapse;
            }
        }
    },
    created () {
        this.collapsedState = this.collapsed;
    },
    methods: {
        toggleCollapse () {
            this.collapsedState = !this.collapsedState;
        }
    },
};
</script>

<style lang="scss" scoped>

.card-header {
    h5 {
        margin-bottom: 0;
    }
}

</style>
