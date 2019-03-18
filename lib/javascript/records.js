import CamelCase from 'camelcase'

export default class Records {
  constructor( args = {} ){
    this._records = {}
    this._addNewRecord = args.addNewRecord || this.addNewRecord
    this._associations = args.associations || []
    this._cable = args.cable
    this._modelName = args.modelName
    this._references = args.references
    // A subscription is just it's filter{}
    this._subscriptions = []
    // An ugly object of { filter{}: boolean }
    this._dataLoading = {}
  }

  setAssociatedModels( models ){
    this._associations.forEach( ( association ) => association.model = models.find( ( model ) => model.name == association.class ) )
  }

  getRecord( id ){
    return this._records[id]
  }

  push( record ){

    this._associations.forEach( ( association ) => {
      switch(association.type){
      case 'ActiveRecord::Associations::HasManyAssociation':
        record[ association.name ] = [1]
        break
      case 'ActiveRecord::Associations::BelongsToAssociation':
        var standIn = {}
        Object.defineProperty(standIn, "$count", {
            enumerable: false,
            writable: true
        })
        standIn.$count = 1
        //this._addNewRecord( record, association.name, standIn )
        record[ association.name ] = standIn
        break

      default:
        console.log('Unknown know association type')
      }
    } )

    var newRecord = new Proxy( this.camelCaseKeys( record ), {
      get: ( record, property )=> this.getFromRecord( record, property, this )
    } )

    this._addNewRecord( this._records, newRecord.id, newRecord )
  }

  addNewRecord( records, recordId, record ){
    if( records[ recordId ] ){
      Object.keys( record ).forEach( (key) => records[ recordId ][ key ] = record[ key ] )
    } else {
      records[ recordId ] = record
    }
  }

  forEach( func ){
    Object.keys( this._records ).forEach(( record ) => func( record ) )
  }

  camelCaseKeys( record ){
    return Object.keys( record ).reduce( ( camelRecord, key ) => {
      camelRecord[ CamelCase(key) ] = record[key]
      return camelRecord
    }, {} )
  }

  getFromRecord( record, property, self ){
    self.loadIfAssociation( record, property )
    return record[ property ]
  }
  //If the records already exist it will return an instantaneously resolving promise
  loadRecords( filter = null ){
    if( !this.isSubscribed( filter ) ){

      this._subscriptions.push( filter ? filter : 'all' )
      this.subscribeToRecords( filter )

    }

    return new Promise( (resolve, reject)=> this.awaitData(resolve, reject, filter) )
  }

  awaitData( resolve, reject, filter ){
    setTimeout( ()=>{
      if( this._dataLoading[ filter ] ){
        this.awaitData( resolve, reject, filter )
      } else {
        resolve()
      }
      //TODO there's something wrong with _dataLoading not working so this wait time has been cranked up.
    }, 500 )
  }

  // Adds records that match properties into records
  searchRecords( properties, records ){

    this._records.forEach( ( record ) => {

      var match = true
      Object.keys( properties ).forEach( ( property ) => {
        if( properties[ property ] != record[ property ] ){
          match = false
        }
      })

      if( match ){
        records.push(record)
      }
    })
  }

  isSubscribed( filter = 'all' ){
    if( this._subscriptions.includes( 'all' ) && !filter.IsReference ) {
      return true
    } else {
      return !!this._subscriptions.find( ( sub ) => JSON.stringify(sub) == JSON.stringify(filter) )
    }
  }

  // Subscribing to a record is the source of all data communication. With no filter
  // all records are subscribed to, this is done without checking for existing subscriptions
  // so that needs to be done before getting here.
  subscribeToRecords( filter = null ){

  	let subscriptionParameters = { channel: 'RailsSyncChannel', model: this._modelName }
    this._dataLoading[ filter ] = true

  	if ( filter !== null ) {
  		subscriptionParameters.filter = filter
  	}

  	this._cable.subscriptions.create( subscriptionParameters ,{
  		received: (data) => {
        var records = data.IsReference ? this._references : this
  			// Will find records and update them, if not found will add them to
  			// _records or references.
  			if( data.length > 0){

  				// data is a promise so might not have anything at this point,
  				// adding with a forEach allows promises to be handled (is there a better way?)
  				data.forEach((addModel) => {
  					records.push(addModel)
  				})


  			} else {

          records.push( data )

  			}

        this._dataLoading[ filter ] = false

  		}
  	})
  }

  loadIfAssociation( record, property ){
    var association = this._associations.find( ( a ) => a.name == property )

    if( association ){

      var referencedRecords = []

      if( record[property][0] == 1 ){
        record[property].pop()
      } else if( record[property].$count > 0 ){
        record[property].$count--
      } else {
        this.loadRecords({ IsReference: true, record_id: record.id, association_name: property })
        .then( () => {
          var references = this._references.getRecord( record.id )[ property ]

          if( references.length > 0 && references.length !== record[property].length ){

            references.forEach( ( reference ) => record[property].push( association.model.find( reference ) ) )

          } else if( typeof references.length === 'undefined' && record[property].$count == 0 ) {
            this._addNewRecord(record,property, association.model.find( references ))

          }
        })
      }
    }
  }
}
