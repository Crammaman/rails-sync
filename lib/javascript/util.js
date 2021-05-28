
import SnakeCase from 'snake-case'
export default{
    snakeCaseKeys: function( object){
        return Object.keys( object ).reduce( ( acc, key ) => {
            acc[ SnakeCase(key) ] = object[key]
            return acc
        }, {})
    },
}