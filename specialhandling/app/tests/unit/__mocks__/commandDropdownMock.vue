<script>
import { CommandDropdown } from 'vueoom/src/components';

export default {
    name: 'CommandDropdown',
    extends: CommandDropdown,
    methods: {
        hideDropdown: jest.fn(),
        showDropdown: jest.fn()
    },
    template: `
        <command-group :size="size" :class="[{'dropup': dropup}]">
            <button v-if="split" type="button"
                    class="btn" :class="[isOutline + type, btnSize, { 'active': active }]"
                    @click.stop="handleClick" :disabled="disabled" :aria-pressed="active">
                <icon v-if="icon" :icon="icon" :class="[{'mr-2': label}]"></icon>
                <span class="btn-label">{{ label }}</span>
            </button>
            <button ref="toggle" type="button" class="btn dropdown-toggle"
                    :class="[isOutline + type, btnSize, {'dropdown-toggle-split': split }, {'active': show}]" 
                    :disabled="disabled" aria-haspopup="true" @click="toggle">
                <icon v-if="!split && icon" :icon="icon" :class="[{'mr-2': label}]"></icon>
                <span v-if="!split" class="btn-label">{{ label }}</span>
            </button>
            <div v-show="!disabled && show" ref="content" class="command-dropdown-menu">
                <slot></slot>
            </div>
        </command-group>`
};
</script>
