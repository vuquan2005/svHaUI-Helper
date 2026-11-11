import { beforeEach, describe, expect, it, vi } from 'vitest';
import rules from '../../../public/rules/block-chat.json';
import { initChatBlocking } from './background';

const mocks = vi.hoisted(() => ({
    get: vi.fn(),
    update: vi.fn(),
    changed: vi.fn(),
    installed: vi.fn(),
}));

vi.mock('wxt/browser', () => ({
    browser: {
        storage: { local: { get: mocks.get }, onChanged: { addListener: mocks.changed } },
        runtime: { onInstalled: { addListener: mocks.installed } },
        declarativeNetRequest: { updateEnabledRulesets: mocks.update },
    },
}));

beforeEach(() => {
    vi.resetAllMocks();
    mocks.get.mockResolvedValue({});
    mocks.update.mockResolvedValue(undefined);
});

describe('chat blocking preferences', () => {
    it('defaults to off and responds to enabling, disabling and removed settings', async () => {
        initChatBlocking();
        await vi.waitFor(() => expect(mocks.update).toHaveBeenCalledTimes(1));
        expect(mocks.update).toHaveBeenLastCalledWith({
            enableRulesetIds: [],
            disableRulesetIds: ['block-chat'],
        });

        const onChanged = mocks.changed.mock.calls[0][0];
        onChanged({ app_settings: {} }, 'sync');
        onChanged({ unrelated: {} }, 'local');
        expect(mocks.update).toHaveBeenCalledTimes(1);

        for (const enabled of [true, false, undefined]) {
            mocks.get.mockResolvedValue({ app_settings: { features: { 'block-chat': enabled } } });
            const count = mocks.update.mock.calls.length;
            onChanged({ app_settings: {} }, 'local');
            await vi.waitFor(() => expect(mocks.update).toHaveBeenCalledTimes(count + 1));
            expect(mocks.update).toHaveBeenLastCalledWith({
                enableRulesetIds: enabled ? ['block-chat'] : [],
                disableRulesetIds: enabled ? [] : ['block-chat'],
            });
        }
    });

    it('restores the preference on extension update', async () => {
        mocks.get.mockResolvedValue({ app_settings: { features: { 'block-chat': true } } });
        initChatBlocking();
        await vi.waitFor(() => expect(mocks.update).toHaveBeenCalledTimes(1));
        mocks.installed.mock.calls[0][0]();
        await vi.waitFor(() => expect(mocks.update).toHaveBeenCalledTimes(2));
        expect(mocks.update).toHaveBeenLastCalledWith({
            enableRulesetIds: ['block-chat'],
            disableRulesetIds: [],
        });
    });

    it('serializes rapid changes and applies the latest preference last', async () => {
        let finishUpdate!: () => void;
        mocks.update.mockImplementationOnce(
            () =>
                new Promise<void>((resolve) => {
                    finishUpdate = resolve;
                })
        );
        initChatBlocking();
        await vi.waitFor(() => expect(mocks.update).toHaveBeenCalledTimes(1));
        mocks.get.mockResolvedValue({ app_settings: { features: { 'block-chat': true } } });
        mocks.changed.mock.calls[0][0]({ app_settings: {} }, 'local');
        expect(mocks.update).toHaveBeenCalledTimes(1);
        finishUpdate();
        await vi.waitFor(() => expect(mocks.update).toHaveBeenCalledTimes(2));
        expect(mocks.update).toHaveBeenLastCalledWith({
            enableRulesetIds: ['block-chat'],
            disableRulesetIds: [],
        });
    });
});

it('targets only the chat embed script, including query parameters', () => {
    const rule = rules[0];
    expect(rule.action.type).toBe('block');
    expect(rule.condition.initiatorDomains).toEqual(['sv.haui.edu.vn']);
    expect(rule.condition.resourceTypes).toEqual(['script']);
    const pattern = new RegExp(rule.condition.regexFilter);
    expect(pattern.test('https://chat.1102.vn/embed.min.js')).toBe(true);
    expect(pattern.test('https://chat.1102.vn/embed.min.js?v=2')).toBe(true);
    for (const url of [
        'https://chat.1102.vn/other.js',
        'https://chat.1102.vn/embed.min.js/other',
        'https://chat.1102.vn/embed.min.json',
        'https://chat.1102.vn.evil.example/embed.min.js',
        'https://example.com/embed.min.js',
    ])
        expect(pattern.test(url)).toBe(false);
});
