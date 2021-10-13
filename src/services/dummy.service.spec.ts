import { DummyService } from './dummy.service';

describe('Dummy Service', () => {
    test('foo method should return Dummy', async () => {
        const service = new DummyService();
        const value = await service.foo();
        expect(value).toMatchObject({
            foo: 'hello world'
        });
    });
});
