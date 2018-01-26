export default {
    props: {
        definition: {
            type: Object,
            required: true,
        },
        value: {}
    },
    methods: {
        validate() {
            return true;
        }
    }
}
