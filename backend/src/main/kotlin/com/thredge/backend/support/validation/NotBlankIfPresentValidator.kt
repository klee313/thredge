package com.thredge.backend.support.validation

import jakarta.validation.ConstraintValidator
import jakarta.validation.ConstraintValidatorContext

class NotBlankIfPresentValidator : ConstraintValidator<NotBlankIfPresent, String?> {
    override fun isValid(value: String?, context: ConstraintValidatorContext): Boolean =
        value == null || value.isNotBlank()
}
