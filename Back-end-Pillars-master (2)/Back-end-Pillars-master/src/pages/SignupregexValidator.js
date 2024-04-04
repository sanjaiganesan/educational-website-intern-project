export const nameValidator = name => {
    const nameRegex = /^(?=.*?[A-Z])(?=.*?[0-9]).{8,}$/;
    return nameRegex.test(name)
}

export const emailValidator = email => {
    const emailRegex = /^(?=.*?[0-9])[^\s@]+@[^\s@]+$/;
    return emailRegex.test(email)
}

export const numberValidator = number => {
    const numberRegex = /^(?=.*?[0-9]).{10}$/;
    return numberRegex.test(number)
}


export const passwordValidator = password => {
    const passwordRegex = /^(?=.*?[A-Z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,20}$/;
    return passwordRegex.test(password)
}

export const repasswordValidator = repassword => {
    const repasswordRegex = /^(?=.*?[A-Z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,20}$/;
    return repasswordRegex.test(repassword)
}