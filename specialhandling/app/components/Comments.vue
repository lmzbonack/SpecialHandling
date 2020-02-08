<template>
    <div class="comment">
        <h5 class="comment__header">
            Comments
            <span class="badge badge-default">{{ Object.keys(comments).length }}</span>
        </h5>
        <div class="comment__list">
            <ul class="list-group" role="list">
                <div class="list-group-item justify-content-between" v-for="comment in comments" :key="comment.id" role="listitem">
                    <div class="comment__body">
                        <div class="d-flex justify-content-start"> 
                            <h6 class="mb-1">{{ comment.user | trimUsername }}</h6> 
                        </div>             
                        <small class="mb-2">{{ comment.created | humanizeCreatedDate }}</small>
                    </div>
                    <p class="mb-1">{{ comment.comment }}</p>
                </div>
            </ul>
        </div>
        <div class="comment__form">
            <text-view id="newComment" type="text"
                       v-model="activeComment.comment" 
                       placeholder="Add comment..."
                       :danger="!!errors.comment" :danger-message="errors.comment">
            </text-view>
            <command id="submitComment"
                     label="Submit" type="uared" icon="comment" 
                     @action="postComment" :disabled="disableSubmit"/>
        </div>
    </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
let moment = require('moment');

export default {
    name: 'Comments',
    filters: {
        /**
         * Return a humanized representation of when the comment was created
         * @returns {String}
         */
        humanizeCreatedDate (val) {
            return moment(val).startOf('minute').fromNow();
        },
        /**
         * Return a username without the `@arizona.edu`, if it exists
         * @returns {String}
         */
        trimUsername (val) {
            return val.endsWith('@arizona.edu')
                ? val.slice(0, -12)
                : val || '';
        }
    },
    props: {
        /**
         * Comments to render
         * @prop {Array}
         */
        comments: {
            type: Array, 
            required: true
        },
        preventSubmission: {
            type: Boolean,
            default: false
        },
    },
    computed: {
        ...mapGetters('checks', [
            'activeCheck'
        ]),
        ...mapGetters('comments', [
            'activeComment',
            'errors'
        ]),
        /**
         * Return whether the comment is empty or not
         * @returns {Boolean}
         */
        disableSubmit () { 
            return this.activeComment.comment.trim() === ""; 
        }
    },
    methods: {
        ...mapActions('comments', [
            'post',
        ]),
        ...mapActions('checks', [
            'fetchCheckById',
            'updateActiveCheck',
        ]),
        /**
         * Post a comment to the api, or, if `preventSubmission` is true, emit @addComment
         * to allow the parent to handle it (i.e. the create modal on the home page stores them
         * for posting later once a check has been created)
         */
        postComment () {
            if (this.preventSubmission) {
                this.$emit('addComment', this.activeComment);
                this.activeComment.comment = "";
            } else {
                this.post()
                    .then(() => this.fetchCheckById(this.activeCheck.id))
                    .then(() => this.updateActiveCheck(this.activeCheck))
                    .then(() => this.activeComment.comment = "");
            }
        }
    }
};
</script>

<style lang="scss" scoped>
.comment {
    position: relative;
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    min-width: 300px;
    max-width: 300px;
    padding: 1rem 0.5rem !important;
    background-color: #f7f7f9;
    align-content: start;

    .comment__header {
        display: flex;
        justify-content: start;
        align-content: center;
        margin-bottom: 1rem;

        .badge {
            margin-left: .5rem;
        }
    }

    .comment__list {
        height: 90%;
        overflow-y: auto;
        max-height: 550px;
    }

    .comment__body {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        width: 100%;
    }

    .comment__form {
        margin-top: 1rem;

        .form-group {
            margin-bottom: 0.5rem;
        }

        button {
            float: right;
        }
    }
}

</style>
