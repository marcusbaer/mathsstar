class VerliebteZahlen extends HTMLElement {
    #baseNumber = 10;
    #statistics = {
        successful: 0,
        failed: 0,
    };
    static observedAttributes = ["runs"];
    static get tagName() {
        return 'verliebte-zahlen';
    }
    constructor() {
        super();
        this.shadow = this.attachShadow({mode: 'open'});
        this.shadow.innerHTML = `
            <div>
                <!-- <p aria-disabled=true part="icon">&#9825;</p> -->
                <input id="a" name="a" type="number" min="0" max="10" aria-label="erste Zahl">
                <input id="b" name="b" type="number" min="0" max="10" aria-label="zweite Zahl">
                <pre></pre>
            </div>
            <style>
                :host { display: flex; justify-content: center; width: 100%; }
                div { display: inline-flex; justify-content: center; background-color: sandybrown; padding: 1rem; }
                input[disabled] { display: none; }
                p { font-size: 140px; position: absolute; top: 55px; margin: 0; }
            </style>
        `;
        this.fields = [
            this.shadow.querySelector('#a'),
            this.shadow.querySelector('#b'),
        ];
        this.logNode = this.shadow.querySelector('pre');
    }
    attributeChangedCallback(_name, _oldValue, newValue) {
        this.startGame(newValue);
    }
    async startGame(runsLeft = 0) {
        // reset statistics
        this.#statistics = {
            successful: 0,
            failed: 0,
        };
        // this.log(runsLeft, this.#statistics.successful, this.#statistics.failed);
        let runs = this.makeRangeIterator(0, runsLeft, 1);
        let result = runs.next();
        while (!result.done) {
            const runOptions = {
                expected: Math.floor(Math.random() * 10),
                position: Math.round(Math.random()),
            };
            // this.log(result.value, this.#statistics.successful, this.#statistics.failed);
            const taskUserInput = await this.startTask(runOptions);
            if (taskUserInput == runOptions.expected) {
                this.#statistics.successful++;
            } else {
                this.#statistics.failed++;
            }
            result = runs.next();
        }
        this.gameOver();
    }
    startTask(runOptions = {}) {
        const promise = new Promise((resolve, reject) => {
            const eventHandler = (event) => {
                resolve(event.target.value);
            };
            this.fields.forEach((input) => {
                try {
                    input.removeEventListener('input', eventHandler);
                    input.readOnly = true;
                    input.value = '';
                } catch (_e) {
                }
            });
            const taskPosition = (runOptions.position > 0) ? 0 : 1;
            this.fields[taskPosition].value = this.#baseNumber - runOptions.expected;
            this.fields[runOptions.position].addEventListener('input', eventHandler);
            this.fields[runOptions.position].readOnly = false;
            this.fields[runOptions.position].focus();
        });

        return promise;
    }
    gameOver() {
        this.fields.forEach((input) => {
            try {
                input.readOnly = true;
                input.value = '';
                input.disabled = true;
            } catch (_e) {
            }
        });
        this.send('game-over', this.#statistics);
        this.log(`${this.#statistics.successful} richtige und ${this.#statistics.failed} falsche Antworten!`);
    }
    makeRangeIterator(start = 0, end = Infinity, step = 1) {
        let nextIndex = start;
        let iterationCount = 0;
        const rangeIterator = {
            next() {
            let result;
            if (nextIndex < end) {
                result = { value: nextIndex, done: false };
                nextIndex += step;
                iterationCount++;
                return result;
            }
            return { value: iterationCount, done: true };
            },
        };
        return rangeIterator;
    }
    send(type, ...values) {
        const event = new CustomEvent(type, {
            detail: values,
        });
        this.dispatchEvent(event);
    }
    log(...values) {
        this.logNode.textContent = values.join(', ');
    }
}
customElements.define(VerliebteZahlen.tagName, VerliebteZahlen);
