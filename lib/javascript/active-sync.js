import Model from './model.js'

export default class ActiveSync {

  static models = []

  constructor( args ){
    this._modelNames = args.modelNames || [];
    this._models = args.models || [];
  }

  install( vue ){
    this._modelNames.forEach((name)=> this._models.push(this.createModel(name)))
    this._models.forEach((model)=> vue.prototype["$" + model.className] = model)
  }

  createModel(name){
    let modelClass = Model
    return eval(`(class ${name} extends modelClass { static className = '${name}' })`)
  }
}



// Code for dynamically requesting Model names and associations.
//
// Object.keys( modelDescriptions ).forEach( ( modelName ) =>{
//   modelDescriptions[modelName].name = modelName
//   this.setupModel( modelDescriptions[modelName] )
// })

// var modelDescriptions = this.requestModelDescriptions()
// this._models.forEach( ( model ) => model.setAssociatedModels( this._models))
// args.afterSetup( this._models )
// requestModelDescriptions(){
//   var xmlHttp = new XMLHttpRequest()
//   xmlHttp.open( "GET", 'active_sync/models', false ) // false for synchronous request
//   xmlHttp.send( null )
//   return JSON.parse(xmlHttp.responseText)
// }