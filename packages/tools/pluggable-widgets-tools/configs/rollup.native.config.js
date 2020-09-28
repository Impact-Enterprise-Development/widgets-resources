const { join } = require("path");
const babel = require("@rollup/plugin-babel").default;
const commonjs = require("@rollup/plugin-commonjs");
const copy = require("rollup-plugin-copy");
const nodeResolve = require("@rollup/plugin-node-resolve").default;
const { terser } = require("rollup-plugin-terser");
const typescript = require("rollup-plugin-typescript2");
const {
    package: { packagePath, widgetName },
    sourcePath,
    widgetEntry
} = require("./variables");

const out = join(sourcePath, "/dist/tmp/widgets/");

module.exports = args => {
    const production = Boolean(args.prod);
    delete args.prod;

    return ["ios", "android"].map(os => ({
        input: widgetEntry,
        output: {
            format: "esm",
            file: join(out, `${packagePath.replace(/\./g, "/")}/${widgetName.toLowerCase()}/${widgetName}.${os}.js`)
        },
        external: ["react", "big.js", "react-native", /^mendix/],
        plugins: [
            nodeResolve({
                extensions: [`.${os}.js`, ".js"]
            }),
            babel({
                babelHelpers: "bundled",
                babelrc: false,
                plugins: [
                    "@babel/plugin-proposal-class-properties",
                    "@babel/plugin-transform-flow-strip-types",
                    "@babel/plugin-transform-react-jsx"
                ]
            }),
            typescript({ tsconfigOverride: { compilerOptions: { target: "es2019" } } }),
            commonjs(),
            copy({
                targets: [
                    {
                        src: `${sourcePath}/src/**/*.xml`.replace(/\\/g, "/"),
                        dest: out
                    }
                ]
            }),
            ...(production ? [terser({ mangle: false })] : [])
        ],
        onwarn: function(warning, warn) {
            if (warning.code !== "THIS_IS_UNDEFINED") {
                console.error(warning.toString());
                process.exit(1);
            }
        }
    }));
};

function copyReactNativeModules() {
    return {
        name: "copy-react-native-modules",
        async resolveId(source) {
            if (!source.startsWith("react-native-")) {
                return null;
            }
            return { id: source, external: true };
        },
        async generateBundle(_, bundle) {
            const rnDependencies = Object.values(bundle)
                .flatMap(c => c.consts)
                .filter(d => d.startsWith("react-native-"));
            console.log(rnDependencies);
        }
    };
}
