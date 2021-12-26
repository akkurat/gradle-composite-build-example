import {cpSync,renameSync} from 'fs'
import r from 'replace-in-file' 



const out = 'test'


    const dep = num => `
    implementation('com.example:Sub${num}:1.0.0')

    additionalResources(group: 'com.example', name: 'Sub${num}', version: '1.0.0') {
        capabilities {
            requireCapability('com.example:Sub${num}-my-feature')
        }
    }
`

const prjs = [...Array(50).keys()]
for ( const prj of prjs )
{
    const dest = out + '/Sub' + prj
    cpSync( 'stencil/sub', dest, {recursive: true})

    const file = `${dest}/src/main/java/org/example/ExampleClass.java`

    r.replaceInFileSync({
        files: [file,`${dest}/build.gradle`],
        from: /\{\{num\}\}/g,
        to: prj
    })
    const otherPrj = parseInt((prj)/10) 

    let deps
    if( otherPrj != prj ) {
        deps = dep(otherPrj)
    } else {
        deps = ""
    }

        r.replaceInFileSync({
            files: `${dest}/build.gradle`,
            from: /\{\{deps\}\}/g,
            to: deps
        })

    renameSync(file, `${dest}/src/main/java/org/example/ExampleClass${prj}.java`)

    r.replaceInFileSync({
        files: [file,`${dest}/settings.gradle`],
        from: /\{\{other\}\}/g,
        to: `includeBuild('../Sub${otherPrj}')`
    })
    

}
const destMain = `${out}/main`
cpSync( 'stencil/main', destMain, {recursive: true})


    const deps = `
dependencies {
    ${prjs.map( prj => dep(prj)).join("\n")}
}`

    r.replaceInFile({
        files: `${destMain}/build.gradle`,
        from: "{{deps}}",
        to: deps
    })

    const includes = prjs.map( prj => `includeBuild('../Sub${prj}')`).join("\n")

    r.replaceInFile({
        files: `${destMain}/settings.gradle`,
        from: "{{subs}}",
        to: includes
    })
