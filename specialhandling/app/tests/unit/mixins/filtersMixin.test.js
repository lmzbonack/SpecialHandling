import { mount } from '@vue/test-utils';
import filtersMixin from '../../../mixins/filters';

describe('filtersMixin.test.js', () => {
    let wrapper;

    const Component = {
        render () {},
        mixins: [filtersMixin]
    };

    beforeEach(() => {
        wrapper = mount(Component, {
            propsData: {
                gridApi: {
                    setFilterModel: jest.fn(),
                    onFilterChanged: jest.fn()
                },
                rowData: []
            },
            data () {
                return {
                    grid: {
                        externalFilters: {
                            hasCheckNumber: 'all',
                            user: ''
                        }
                    },
                    filters: {
                        contacted: {
                            value: ''
                        },
                        picked_up: {
                            value: ''
                        }
                    }
                };
            }
        });
    });

    // Events

    it('emits `close`', () => {
        expect(wrapper.emitted().close).toBeFalsy();
        wrapper.vm.close();
        expect(wrapper.emitted().close).toBeTruthy();
    });

    it('emits `filterByHasCheckNumber`', () => {
        expect(wrapper.emitted().filterByHasCheckNumber).toBeFalsy();
        wrapper.vm.filterByHasCheckNumber('true');
        expect(wrapper.emitted().filterByHasCheckNumber).toBeTruthy();
        expect(wrapper.emitted().filterByHasCheckNumber[0]).toEqual(['true']);
    });

    it('emits `filterByUser`', () => {
        expect(wrapper.emitted().filterByUser).toBeFalsy();
        wrapper.vm.filterByUser('arnold schwarzenegger');
        expect(wrapper.emitted().filterByUser).toBeTruthy();
        expect(wrapper.emitted().filterByUser[0]).toEqual(['arnold schwarzenegger']);
    });

    // Methods

    // filterByContacted
    test('`filterByContacted` method returns correct results', () => {
        expect(wrapper.vm.filters.contacted.value).toBe('');
        wrapper.vm.filterByContacted('true');
        expect(wrapper.vm.filters.contacted.value).toBe('true');
        wrapper.vm.filterByContacted('false');
        expect(wrapper.vm.filters.contacted.value).toBe('false');
        wrapper.vm.filterByContacted('all');
        expect(wrapper.vm.filters.contacted.value).toBe('none');
    });

    test('`filterByPickedUp` method returns the correct results', () => {
        expect(wrapper.vm.filters.picked_up.value).toBe('');
        wrapper.vm.filterByPickedUp('true');
        expect(wrapper.vm.filters.picked_up.value).toBe('true');
        wrapper.vm.filterByPickedUp('false');
        expect(wrapper.vm.filters.picked_up.value).toBe('false');
        wrapper.vm.filterByPickedUp('all');
        expect(wrapper.vm.filters.picked_up.value).toBe('none');
    });
});
