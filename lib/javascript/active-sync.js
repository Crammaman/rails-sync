import ActionCable from 'actioncable'
import Model from './model.js'

export default class ActiveSync {
  constructor( args ){

    this._cable = ActionCable.createConsumer()
    this._models = []
    this._customModels = args.customModels || []

    this._modelOptions = {
      addNewRecord: args.addNewRecord,
      afterFind: args.afterFind
    }

    var modelDescriptions = this.requestModelDescriptions()

    Object.keys( modelDescriptions ).forEach( ( modelName ) =>{
      modelDescriptions[modelName].name = modelName
      this.setupModel( modelDescriptions[modelName] )
    })

    this._models.forEach( ( model ) => model.setAssociatedModels( this._models))
    args.afterSetup( this._models )

  }

  static install( Vue, options ){
    var rs = new ActiveSync({
      addNewRecord: (  records, id, record  ) => {
        if( records[ id ] ){
          Object.keys( record ).forEach( (key) => Vue.set( records[ id ], key, record[key] ) )
        } else {
          Vue.set( records, id, record )
        }
      },

      afterSetup: ( models ) => {
        models.forEach( ( model ) => {
          Vue.prototype[ '$' + model.name ] = model
        })
      },

      customModels: (options || {}).customModels
    })
  }

  requestModelDescriptions(){
    var xmlHttp = new XMLHttpRequest()
    xmlHttp.open( "GET", 'active_sync/models', false ) // false for synchronous request
    xmlHttp.send( null )
    return JSON.parse(xmlHttp.responseText)
  }

  setupModel( modelDescription ){
    var CustomModel = this._customModels.find(( m ) => m.name == modelDescription.name )

    if( CustomModel ){

      this._models.push( new CustomModel( modelDescription, this._cable, this._modelOptions ) )

    } else {

      this._models.push( new Model( modelDescription, this._cable, this._modelOptions ) )

    }
  }
}
