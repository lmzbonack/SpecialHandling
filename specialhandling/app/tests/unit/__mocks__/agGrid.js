// Mock the agGrid component from Vueoom's agGrid plugin

/**
 * Usage:
 * 
 * ```js
 * import { createLocalVue } from '@vue/test-utils';
 * import agGridMock from '../__mocks__/agGrid.js';
 * const localVue = createLocalVue();
 * localVue.component(agGridMock.name, agGridMock)
 * ```
 * 
 * Then in your mounted component:
 * 
 * ```js
 * wrapper = mount(Name, {
 *     localVue
 * })
 * 
 * Be sure _not_ to shim the `ag-grid-vue` component.
 * 
 * To test the `@rowSelect` event, find the `#row` and click it (like in the real component)
 * Unless all you care about is the event being called (checking it like any other jest.fn())
 * you'll need to use wrapper.setMethods(), like so:
 * 
 * const grid = wrapper.find(agGridMock);
 * grid.setMethods({
 *     onSelectRow: function () {
 *         this.$emit('rowSelect', checks[0]);
 *     }
 * });
 * grid.find('#row').trigger('click');
 * expect(grid.emitted).toHaveLength(1);
 * 
 */

let methods = {
    onSelectRow: () => jest.fn()
};

export default {
    name: 'ag-grid-vue',
    data () {
        return {
            gridOptions: {
                api: {
                    deselectAll: () => jest.fn(),
                    redrawRows: () => jest.fn(),
                    setQuickFilter: () => jest.fn(),
                    showLoadingOverlay: () => jest.fn(),
                    hideOverlay: () => jest.fn()
                }
            }
        };
    },
    render (h) {
        return h(
            'div',
            {
                attrs: {
                    id: 'grid'
                },
                ref: 'grid',
            },
            [
                h(
                    'div', 
                    {
                        attrs: {
                            id: 'row'
                        },
                        on: {
                            click () { methods.onSelectRow(); }
                        }
                    })
            ]); 
    },
    methods: {
        ...methods
    }
};
