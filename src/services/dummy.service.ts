import { Service } from '@ekonoo/lambdi';

import { Dummy } from '../models/dummy.model';

@Service()
export class DummyService {
    async foo(): Promise<Dummy> {
        return Promise.resolve({ foo: 'hello world' });
    }

    async check(dummy: Dummy): Promise<boolean> {
        // check the dummy
        return true;
    }

    async save(dummy: Dummy): Promise<void> {
        // maybe save the dummy ?
    }
}
