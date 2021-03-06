<?php
namespace AB\Bundle\Form\Type;
use FOS\UserBundle\Form\Type\RegistrationFormType as BaseType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;
use Symfony\Component\Validator\Constraints\True;
class MentorProfileType extends BaseType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->add('firstName');
        $builder->add('lastName');
        $builder->add('facebookId');
        $builder->add('linkedInId', 'text', array(
            'required' => false
        ));
        /*$builder->add('email', 'email', array(
            'required' => true
        ));*/
        $builder->add('homeCity');
        $builder->add('about', 'textarea', array(
            'trim' => false
        ));
        $builder->add('schoolName');
        $builder->add('schoolGraduationYear');
        $builder->add('schoolCity');
        $builder->add('courses', 'collection', array(
            'type' => new CourseType(),
            'allow_add' => true,
            'allow_delete' => true,
            'by_reference' => false,
            'options'  => array(
                'required'  => true,
            ),
        ));
        //$builder->add('save', 'submit');
    }
    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults(array(
            'data_class' => 'AB\Bundle\Entity\Mentor'
        ));
    }
    public function getName()
    {
        return 'user_details_edit';
    }
}