// eslint-disable-next-line @typescript-eslint/no-var-requires,import/no-extraneous-dependencies
const Sequencer = require('@jest/test-sequencer').default;

class CustomSequencer extends Sequencer {
	sort(tests) {
		return Array.from(tests).sort((testA, testB) => (testA.path > testB.path ? 1 : -1));
	}
}

module.exports = CustomSequencer;
