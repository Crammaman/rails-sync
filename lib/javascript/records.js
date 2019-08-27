import CamelCase from 'camelcase'
import SnakeCase from 'snake-case'

export default class Records {
  constructor( args = {} ){
    this._records = {}
    this._addNewRecord = args.addNewRecord || this.addNewRecord
    this._associations = args.associations || []
    this._cable = args.cable
    this._modelName = args.modelName
    this._references = args.references
    this._autoLoadAssociations = !!args.autoLoadAssociations
    // A subscription is just it's filter{}
    this._subscriptions = []
    // An ugly object of { filter{}: boolean }
    this._dataLoading = {}
  }

  setAssociatedModels( models ){
    this._associations.forEach( ( association ) => {
      var model = models.find( ( model ) => model.name == association.class )
      if( model ){
        association.model = model
      } else {
        throw `Model ${this._modelName} is set up for association with ${association.class} but ${association.class} is not available through Active Sync`
      }
    } )
  }

  getRecord( id ){
    return this._records[id]
  }

  assignAssociationStandIns( record ){
    // A record is not received with its associations, for reactive systems to
    // be able to react to the loading of an association the record needs an object/array
    // to be at time of the record coming in.
    this._associations.forEach( ( association ) => {
      switch(association.type){
      case 'ActiveRecord::Associations::HasManyAssociation':
      case 'ActiveRecord::Associations::HasManyThroughAssociation':
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
        console.log('Unknown know association type ' + association.type)
      }
    } )
  }

  push( record ){

    this.assignAssociationStandIns( record )

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
    Object.keys( this._records ).forEach(( id ) => func( this._records[id] ) )
  }

  camelCaseKeys( record ){
    return Object.keys( record ).reduce( ( camelRecord, key ) => {
      camelRecord[ CamelCase(key) ] = record[key]
      return camelRecord
    }, {} )
  }
  snakeCaseKeys( record ){
    return Object.keys( record ).reduce( ( camelRecord, key ) => {
      camelRecord[ SnakeCase(key) ] = record[key]
      return camelRecord
    }, {} )
  }

  getFromRecord( record, property, self ){
    
    if( self._autoLoadAssociations ){ 
      
      var association = self._associations.find( ( a ) => a.name == property )
      
      if( !!association){
        
        self.loadAssociation( record, association ) 
        return record[ property ]
        
      } else {
      
        return record[ property ]
        
      }
    } else if( property === 'load' ) {
      
      return ( associationName ) => {
        
        var association = self._associations.find( ( a ) => a.name == associationName )
        self.loadAssociation( record, association )
        
        return record 
        
      }
      
    } else {
    
      return record[ property ]
    
    }
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
    }, 200 )
  }

  // Adds records that match properties into records
  forEachMatch( properties, func ){

    let records = []

    this.forEach( ( record ) => {

      var match = true
      Object.keys( properties ).forEach( ( property ) => {
        if( properties[ property ] != record[ property ] ){
          match = false
        }
      })

      if( match ){
        func(record)
      }
    })

    return records
  }

  isSubscribed( filter ){
    filter = filter ? filter : 'all'
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

  	let subscriptionParameters = { channel: 'ActiveSyncChannel', model: this._modelName }
    this._dataLoading[ filter ] = true

  	if ( filter !== null ) {
  		subscriptionParameters.filter = filter.IsReference ? filter : this.snakeCaseKeys(filter)
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

  loadAssociation( record, association ){

    var referencedRecords = []
    
    this.loadRecords( { IsReference: true, record_id: record.id, association_name: association.name } )
    .then( () => {
      var references = this._references.getRecord( record.id )[ association.name ]

      if( typeof references.length !== 'undefined' ){
        record[association.name] = []
        references.forEach( ( reference ) => {
          record[association.name].push( association.model.find( reference ) )
        } )

      } else {

        this._addNewRecord( record, association.name, association.model.find( references ))

      }
    })
    
    return record
  }
}
