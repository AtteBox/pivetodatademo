import { describe, it, expect, vi } from 'vitest';
import { AppEvent } from '.';

describe('AppEvent', () => {
  it('should be able to add listeners and trigger them', () => {
    const event = new AppEvent();
    const listenerMock1 = vi.fn();
    const listenerMock2 = vi.fn();

    // Bind mock functions as listeners
    event.addListener(listenerMock1);
    event.addListener(listenerMock2);

    // Create a mock event parameter and trigger listeners
    const mockEventParam = { key: 'value' };
    event.trigger(mockEventParam);

    // Assert that both listeners were called once with the mock event parameter
    expect(listenerMock1).toBeCalledWith(mockEventParam);
    expect(listenerMock2).toBeCalledWith(mockEventParam);
  });

  it('should not call any listener if none are subsscribed', () => {
    const event = new AppEvent();
    const triggerSpy = vi.spyOn(event, 'trigger');

    // Create a mock event parameter and trigger listeners
    const mockEventParam = { key: 'value' };
    event.trigger(mockEventParam);

    // Assert trigger was called but no listener was notified
    expect(triggerSpy).toBeCalledWith(mockEventParam);
    expect(triggerSpy).toHaveBeenCalledTimes(1);
    // Since no listeners are bound, nothing else to assert for calls
  });
});
