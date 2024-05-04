# Action Store

Simple Light DOM "HTML" Web Component for getting and setting values in local storage.

## <action-store>

### Attributes

* store: `store="example-store"` string which is the key for the local storage to use
* store-listen: set this attribute to have the component listen for the "storage" event. This will trigger reupdate on all data-get-store elements.
* event-type: event that triggers the setStore on form fields. Defaults to "change"
* debug: show all my console.logs for testing purposes

## Enhancing Elements

Get or set store by adding data attributes to any child elements of this component.

### Attributes

* `data-get-store`
  * Retrieves a value from the local storage and updates the element with the retrieved value.
  * Updates form field values or checks checkboxes or radios.
  * Normal elements have their textContent replaced with the retrieved value.
  * add a value to make it access a named property of the local storage object `data-get-store="animal"`; without a value it assumes the local storage is a simple string.
* `data-set-store`
  * Stores value from form fields on "change" (or "input")
  * Dispatches a StorageEvent with the local storage key so that any matching data-get-store elements that are listening will update.
  * add a value to make it save as a named property of the local storage object `data-get-store="animal"`; without a value it assumes the local storage is a simple string.