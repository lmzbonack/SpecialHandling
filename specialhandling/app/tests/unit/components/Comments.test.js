import { mount, shallowMount, createLocalVue } from '@vue/test-utils';
import Vueoom, { Command } from 'vueoom';
import Comments from '../../../components/Comments.vue';

const localVue = createLocalVue();
localVue.use(Vueoom);

describe('Comments.test.js', () => {
    let wrapper;

    let props = {
        comments:[
            {   
                comment: "Look Here",
                user: "lmzbonack@arizona.edu",
                related_check: 1
            },
            {   
                comment: "Look Here",
                user: "lmzbonack@arizona.edu",
                related_check: 1
            }
        ]
    };
    
    let dateNowSpy;
    let checks = [
        {
            id: 1,
            user: "lmz",
            created: "2018-04-06T13:14:04.634963",
            modified: "2018-04-06T13:14:06.298420",
            payee_name: "Tyrion Lannister",
            payee_number: "123456",
            edoc_number: "789",
            org_code: "1",
            instructions: "FedEx",
            check_number: "465768413846532",
            contact_name: "Tywin Lannister",
            contact_number: "520-123-4567",
            contact_email: "tlan@caterlyrock.net",
            contacted: true,
            picked_up: false,
            signature: {
                first_name: 'Bob',
                last_name: 'Ross',
                signature: 'dsfsdfasefsdfasefsxcvasfawesfdfaesfd',
                related_check: 1,
                created: "2018-04-07T13:14:04.634963",
                modified: "2018-04-07T13:14:06.298420",
                id: 1,
                user: 'lmz'
            },
            comments: [
                {
                    comment: 'Is this for Rohan',
                    created: '2018-04-30T14:43:37.013429',
                    modified: '2018-04-30T14:43:37.013908',
                    related_check: '1',
                    user: 'lmz'
                }
            ]
        },
        {
            id: 2,
            user: "lmz",
            created: "2018-04-16T20:16:57.547891",
            modified: "2018-04-16T20:16:57.548294",
            payee_name: "Thaddeus Thopterboy",
            payee_number: "1238992",
            edoc_number: 8988787,
            org_code: "4444",
            instructions: "Call for pickup",
            check_number: "63461874632187463218743",
            contact_name: "Ya boy Timmy",
            contact_number: "623-123-4567",
            contact_email: "timmy@aol.com",
            contacted: false,
            picked_up: false,
            signature: {
                first_name: 'Bob',
                last_name: 'Ross',
                signature: 'dsfsdfasefsdfasefsxcvasfawesfdfaesfd',
                related_check: 2,
                created: "2018-04-07T13:14:04.634963",
                modified: "2018-04-07T13:14:06.298420",
                id: 2,
                user: 'lmz'
            },
            comments: [
                {
                    comment: 'Space Space Space Space',
                    created: '2018-04-30T14:43:44.924575',
                    modified: '2018-04-30T14:43:44.925079',
                    related_check: '2',
                    user: 'lmz'
                }
            ]
        }
    ];

    let actions = {
        post: jest.fn(() => Promise.resolve([])),
        fetchCheckById: jest.fn(),
        updateActiveCheck: jest.fn()
    };

    beforeAll(() => {
        // This allows us to use moment by making `new Date.now()` always return a single date.
        dateNowSpy = jest.spyOn(Date, 'now').mockImplementation(() => 1487076708000);
    });

    afterAll(() => {
        dateNowSpy.mockReset();
        dateNowSpy.mockRestore();
    });

    beforeEach(() => {
        wrapper = mount(Comments, {
            localVue,
            propsData: {
                ...props
            },
            computed: {
                activeCheck: () => { return checks[0]; },
                activeComment: () => { return { comment: "Mini Pigs in Spaaccceeee!!" }; },
                errors: () => { return {}; },
                disableSubmit () { return this.activeComment.comment.trim() === ""; }
            },
            methods: {
                ...actions
            }
        });
    });


    it('has the expected html structure', () => {
        expect(wrapper.element).toMatchSnapshot();
    });

    it('calls the post method when the Submit button is hit', () => {
        expect(wrapper.vm.disableSubmit).toBeFalsy();
        wrapper.findAll(Command).at(0).trigger('click');
        expect(actions.post).toHaveBeenCalled();
    });

    it('fails to call postComment when Submit button is disabled', () => {
        
        let cmp = shallowMount(Comments, {
            localVue,
            propsData: {
                ...props
            },
            computed: {
                activeCheck: () => { return checks[0]; },
                activeComment: () => { return { comment: "" }; },
                errors: () => { return {}; },
                disableSubmit () { return this.activeComment.comment.trim() === ""; }
            },
            methods: {
                ...actions
            }
        });

        actions.post.mockClear();
        expect(cmp.vm.disableSubmit).toBeTruthy();
        cmp.findAll(Command).at(0).trigger('click');
        expect(actions.post).not.toHaveBeenCalled();
    });

    it('calls the fetchAll method when the Submit button is hit', () => {
        expect(wrapper.vm.disableSubmit).toBeFalsy();
        wrapper.findAll(Command).at(0).trigger('click');
        expect(actions.fetchCheckById).toHaveBeenCalled();
        expect(actions.updateActiveCheck).toHaveBeenCalled();
    });
    
    // This requires getter/setter computed properties
    // it.skip('updates the active comment when when input is typed into the text-view', () => {

    // });
});
