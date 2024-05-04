function isJsonObject(str: string) {
	try {
		const json = JSON.parse(str);
		return !!json && typeof json === "object";
	} catch (e) {
		return false;
	}
}

function isHTMLInputElement(el: Element | EventTarget | null): el is HTMLInputElement {
	return el instanceof HTMLInputElement;
}

function isField(el: Element | EventTarget | null): el is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement {
	return isHTMLInputElement(el) || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement;
}

function isCheckbox(el: HTMLElement): el is HTMLInputElement {
	return isHTMLInputElement(el) && el.type === "checkbox";
}

function isRadio(el: HTMLElement): el is HTMLInputElement {
	return isHTMLInputElement(el) && el.type === "radio";
}

export class ActionStore extends HTMLElement {
	private getStoreElements!: NodeListOf<HTMLElement>;

	get store() {
		return this.getAttribute("store");
	}

	constructor() {
		super();

		const eventType = this.getAttribute("event-type") || "change";

		// Listener to set store from field values
		this.addEventListener(eventType, (e) => {
			const storeKey = this.store;
			if (!storeKey) return;
			const el = e.target;
			if (isField(el) && el.hasAttribute("data-set-store")) {
				// get value from field unless it is a checkbox or radio that is unchecked then set value to empty string
				const value = (isCheckbox(el) || isRadio(el)) && !el.checked ? "" : el.value;
				// base store is the el.value
				let storeStr: string = value;
				// if there is a prop and local storage is an object and save it as a property of that object
				const prop = el.dataset.setStore;
				const ls = localStorage.getItem(storeKey) || "{}";
				this.log("setStore", storeKey, storeStr, prop, ls);
				if (prop) {
					const storeObject: Record<string, string> = ls && isJsonObject(ls) ? JSON.parse(ls) : {};
					storeObject[prop] = storeStr;
					storeStr = JSON.stringify(storeObject);
				}
				// set store
				this.log("setStore: store", storeKey, storeStr);
				localStorage.setItem(storeKey, storeStr);
				window.dispatchEvent(new StorageEvent("storage", { key: storeKey, oldValue: ls, newValue: storeStr }));
			}
		});

		// Listener for storage event to get values from store
		if (this.hasAttribute("store-listen")) {
			window.addEventListener("storage", (e) => {
				const storeKey = this.store;
				if (!storeKey) return;
				if (e.key === storeKey) {
					this.getStoreForAllElements();
				}
			});
		}
	}

	connectedCallback() {
		console.log("connected");

		this.getStoreElements = this.querySelectorAll(`[data-get-store]`) as NodeListOf<HTMLElement>;
		this.getStoreForAllElements();
	}

	/**
	 * Loops through all data-get-store elements and runs getStore() for those elements
	 *
	 * @param {HTMLElement} el - The element to update with the retrieved value.
	 * @return {void} This function does not return a value.
	 */
	public getStoreForAllElements() {
		this.getStoreElements.forEach((el) => {
			this.getStore(el as HTMLElement);
		});
	}

	/**
	 * Retrieves a value from the local storage and updates the element with the retrieved value.
	 * Updates form field values or checks checkboxes or radios.
	 * Normal elements have their textContent replaced with the retrieved value.
	 *
	 * @param {HTMLElement} el - The element to update with the retrieved value.
	 * @return {void} This function does not return a value.
	 */
	public getStore(el: HTMLElement) {
		const storeKey = this.store;
		if (!storeKey) return;
		const ls = localStorage.getItem(storeKey);
		if (!ls) return;
		const prop = el.dataset.getStore;
		// if there is a prop and local storage is an object and get the value from the property of that object; else get the value as string from local storage
		const value = prop && isJsonObject(ls) ? JSON.parse(ls)[prop] : ls;
		this.log("getStore", storeKey, prop, value);
		if (value === undefined) return;
		// If this is a field then replace the value with the new value
		if (isField(el)) {
			// temp value to check if changed
			let changed = false;
			// If this is a checkbox or radio then set the checked value or unset if value does not match
			if (isCheckbox(el) || isRadio(el)) {
				const checked = el.checked;
				el.checked = el.value === value;
				changed = el.checked !== checked;
			} else if (el.value !== value.toString()) {
				// else if this is not a checkbox or radio then set the value if it does not match
				el.value = value.toString();
				changed = true;
			}
			// dispatch change event if changed
			if (changed) el.dispatchEvent(new Event("change", { bubbles: true }));
		} else {
			el.textContent = value.toString();
		}
	}

	/**
	 * A method to log messages if the 'debug' attribute is set.
	 *
	 * @param {any[]} args - The arguments to be logged.
	 * @return {void} This function does not return a value.
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private log(...args: any[]): void {
		// eslint-disable-next-line no-console
		if (this.hasAttribute("debug")) console.log(...args);
	}
}

customElements.define("action-store", ActionStore);
