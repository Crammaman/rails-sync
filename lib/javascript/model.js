import Records from './records.js'

export default class Model{
  constructor( description, cable, options ){
    this._name = description.name
    this._afterFind = options.afterFind || (( record ) => {})
    this._records = new Records( {
      cable: cable,
      modelName: description.name,
      addNewRecord: options.addNewRecord,
      references: new Records( {
        cable: cable,
        addNewRecord: options.addNewRecord,
        autoLoadAssociations: options.autoLoadAssociations
      }),
      associations: description.associations
    })
  }

  setAssociatedModels( models ){
    this._records.setAssociatedModels( models )
  }

  get name(){
    return this._name
  }

  get all() {
    var allRecords = []
    this._records.loadRecords().then( () => {
      this._records.forEach( ( record ) => {
        allRecords.push( this._records.getRecord( record.id ) )
      })
    })

    return allRecords
  }

  find( id ){

    if( !this._records.getRecord( id ) ){

      this._records.push( { id: id } )
      this._records.loadRecords( { id: id } )
      // .then(()=> this._afterFind( this._records.getRecord( id ) ))
    }


    return this._records.getRecord( id )
  }

  where( properties ){

    var records = []

    this._records.loadRecords( properties ).then( () => {
      this._records.forEachMatch( properties, (record) => {
        records.push( this._records.getRecord( record.id ) )
      })
    })

    return records
  }
}
