<template>
    <transition mode="out-in" name="fade">
        <div class="verify-otp-form" v-if="!accCreated">
            <div class="title">Enter OTP</div>

            <div></div>

            <div class="subtitle is-6">
                Enter OTP sent to:
                <span>{{ emailId }}</span>
            </div>
            <section>
                <form @submit.prevent.stop>
                    <b-field
                        :message="error.otp"
                        :type="{ 'is-danger': !!error.otp }"
                        label="Enter 6 digit OTP"
                    >
                        <b-input
                            @blur="validateOTP"
                            @focus="error.otp = ''"
                            maxlength="6"
                            type="number"
                            v-model="user.otp"
                        ></b-input>
                    </b-field>

                    <div class="buttons m-y-48">
                        <b-button
                            :disabled="loading"
                            :loading="loading"
                            @click="verifyOTP"
                            class="has-text-weight-bold"
                            expanded
                            native-type="submit"
                            type="is-primary"
                            >Verify email</b-button
                        >
                    </div>
                </form>

                <br />
                <div class="is-size-6">
                    <span class="m-r-8">Didn’t receive the OTP?</span>
                    <a @click="resendOTP" class="has-text-weight-semibold"
                        >Resend OTP</a
                    >
                </div>

                <br />

                <div class="is-size-6">
                    <span class="m-r-8">Incorrect email?</span>
                    <a @click="$router.go(-1)" class="has-text-weight-semibold"
                        >Go Back</a
                    >
                </div>
            </section>
        </div>
        <account-creation-success v-else></account-creation-success>
    </transition>
</template>

<script>
import EPassService from '../service/EPassService';
import dotprop from 'dot-prop';
import { showSuccess, showError } from '../utils/toast';
import AccountCreationSuccess from './AccountCreationSuccess';

export default {
    name: 'VerifyOTPForm',
    components: {
        AccountCreationSuccess
    },
    data() {
        const email = sessionStorage.getItem('email');
        const state = sessionStorage.getItem('state');
        sessionStorage.clear();

        return {
            emailId: email,
            user: {
                otp: '',
                state: state
            },
            error: {
                otp: ''
            },
            loading: false,
            accCreated: false
        };
    },
    methods: {
        validateOTP() {
            this.error.otp = '';
            if (!this.user.otp) {
                this.error.otp = 'Please enter otp';
                return;
            }

            if (this.user.otp.length !== 6) {
                this.error.otp = 'Invalid OTP';
            }
        },

        isValid() {
            this.validateOTP();

            return !this.error.otp;
        },

        async verifyOTP() {
            if (!this.isValid()) {
                return;
            }

            this.loading = true;
            try {
                const { data } = await EPassService.verifyOTP({
                    emailId: this.emailId,
                    otp: this.user.otp.trim(),
                    stateName: this.user.state
                });

                this.loading = false;

                if (this.$route.path.indexOf('reset-password') > -1) {
                    sessionStorage.setItem('email', this.emailId);
                    sessionStorage.setItem('auth', data.authToken);
                    this.$router.replace('/reset-password/update');
                } else {
                    this.accCreated = true;
                }
            } catch (error) {
                this.loading = false;
                const message = dotprop.get(error, 'response.data.message');
                if (message) {
                    this.error.otp = message;
                } else {
                    this.error.otp = 'Something went wrong';
                }
            }
        },

        async resendOTP() {
            try {
                await EPassService.requestOTP(this.emailId, this.user.state);

                showSuccess(`OTP sent to ${this.emailId}`);
            } catch (error) {
                showError(`Unable to send OTP`);
            }
        }
    },
    mounted() {
        if (!this.emailId) {
            this.$router.replace('/login');
        }
    },
    created() {}
};
</script>

<style lang="scss">
.verify-otp-form {
    section {
        margin-top: 60px;
        button {
            height: 40px;
        }
        .label {
            font-weight: 600;
        }
    }
}
.m-r-8 {
    margin-right: 8px;
}
</style>
