class NumberKeypad extends HTMLElement {
    static get tagName() {
        return 'number-keypad';
    }
    constructor() {
        super();
        this.shadow = this.attachShadow({mode: 'open'});
        this.shadow.innerHTML = `
            <div>
                <button>1</button>
                <button>2</button>
                <button>3</button>
                <button>4</button>
                <button>5</button>
                <button>6</button>
                <button>7</button>
                <button>8</button>
                <button>9</button>
                <button>0</button>
            </div>
            <pre></pre>
            <style>
                :host { display: flex; justify-content: center; width: 100%; }
                div {
                    display: grid;
                    grid-template: 
                    "a a a" 40px
                    "b c c" 40px
                    "b c c" 40px / 1fr 1fr 1fr;
                }
            </style>
        `;
        this.ctaNode = this.shadow.querySelector('div');
        this.logNode = this.shadow.querySelector('pre');

        this.ctaNode.addEventListener('click', this.onButtonPressed.bind(this));
    }
    connectedCallback() {
        window.addEventListener('keyup', this.onKeyboardInput.bind(this));
    }
    disconnectedCallback() {
        window.removeEventListener('keyup', this.onKeyboardInput.bind(this));
    }
    onButtonPressed(event) {
        event.stopPropagation();
        const button = event.target.closest('button');
        if (button) {
            this.send('user-typed', button.textContent);
        }
    }
    onKeyboardInput(event) {
        const input = event.key;
        if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].indexOf(input) > -1) {
            this.send('user-typed', input);
        }
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
customElements.define(NumberKeypad.tagName, NumberKeypad);
